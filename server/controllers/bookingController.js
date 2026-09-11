const { supabase } = require('../config/supabase');
const { BookingEmail } = require('../emails/BookingEmail');
const { BookingCancelledEmail } = require('../emails/BookingCancelledEmail');
const { getResend, sendEmail, FROM_EMAIL, resolveRecipient } = require('../config/mailer');
const { decrementPromoUsage } = require('./promoCodeController');

// POST /api/bookings
// Requires an authenticated user (verifyToken middleware attaches req.user).
// Booking creation + promo code locking/incrementing happens atomically inside
// the create_booking_with_promo Postgres function — see create_booking_with_promo.sql.
const createBooking = async (req, res) => {
    const {
        packageId,
        packageTitle,
        basePrice,
        studio,
        date,
        dayOfWeek,
        time,
        addOns,
        firstName,
        lastName,
        phone,
        email,
        termsAccepted,
        paymentMode,
        couponCode,
        findUs,
    } = req.body;

    const addOnsArray = Array.isArray(addOns) ? addOns : [];
    const safePackageTitle = packageTitle || 'Studio Session';
    const safeBasePrice = basePrice || '₱0';
    const safeStudio = studio || 'Standard Studio';
    const resolvedFindUs = findUs || null;
    const resolvedPaymentMode = paymentMode || null;
    const resolvedTerms = termsAccepted === true || termsAccepted === 'true' || termsAccepted === 1;

    const { data, error } = await supabase.rpc('create_booking_with_promo', {
        p_user_id: req.user.id,
        p_package_id: packageId || null,
        p_package_title: safePackageTitle,
        p_base_price: safeBasePrice,
        p_studio: safeStudio,
        p_booking_date: date || null,
        p_day_of_week: dayOfWeek || null,
        p_booking_time: time || null,
        p_add_ons: addOnsArray,
        p_first_name: firstName || null,
        p_last_name: lastName || null,
        p_phone: phone ? String(phone) : null, // kept as string to avoid integer overflow, same as original
        p_email: email || null,
        p_terms_accepted: resolvedTerms,
        p_find_us: resolvedFindUs,
        p_payment_mode: resolvedPaymentMode,
        p_coupon_code: couponCode || null,
    });

    if (error) {
        const code = error.message;
        if (code === 'INVALID_CODE') return res.status(400).json({ success: false, error: 'Invalid promo code.' });
        if (code === 'INACTIVE_CODE') return res.status(400).json({ success: false, error: 'This promo code is no longer active.' });
        if (code === 'EXPIRED_CODE') return res.status(400).json({ success: false, error: 'This promo code has expired.' });
        if (code === 'LIMIT_REACHED') return res.status(400).json({ success: false, error: 'This promo code has reached its usage limit.' });

        console.error('❌ Database query error (bookings):', error);
        return res.status(500).json({ success: false, error: 'Failed to complete booking processing.' });
    }

    const newBooking = data[0];

    const formattedAddOns = addOnsArray.length > 0 ? addOnsArray.join(', ') : 'None';
    let emailSent = false;

    try {
        const recipient = resolveRecipient(email);
        const bookingHtml = BookingEmail({
            packageTitle: safePackageTitle,
            basePrice: safeBasePrice,
            studio: safeStudio,
            date: dayOfWeek && date ? `${dayOfWeek}, ${date}` : date || 'Scheduled Date',
            time: time || 'Scheduled Time',
            addOns: formattedAddOns,
            firstName,
            lastName,
            phone,
            email,
            paymentMode: resolvedPaymentMode,
            couponCode,
            findUs: resolvedFindUs,
        });

        const emailResult = await sendEmail({
            from: FROM_EMAIL,
            to: [recipient],
            subject: `Booking Confirmed - ${safePackageTitle}`,
            html: bookingHtml,
        });

        emailSent = emailResult.success;
    } catch (emailErr) {
        console.error('⚠️ Booking saved, but email dispatch failed:', emailErr.message || emailErr);
    }

    return res.status(201).json({
        success: true,
        message: emailSent ? 'Booking saved and confirmation email sent!' : 'Booking saved successfully!',
        data: newBooking,
    });
};

// GET /api/bookings/my
const getMyBookings = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select('id, package_title, base_price, studio, booking_date, day_of_week, booking_time, add_ons, firstName, lastName, phone, email, paymentMode, couponCode, status, created_at')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return res.status(200).json({ success: true, bookings: data });
    } catch (error) {
        console.error('❌ Error fetching user bookings:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch your bookings.' });
    }
};

// PATCH /api/bookings/:id/cancel
const cancelBooking = async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body || {};

    try {
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (fetchError) throw fetchError;

        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found.' });
        }

        const isOwner = String(booking.user_id) === String(req.user.id);
        const isAdmin = req.user?.role === 'admin';
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ success: false, error: 'You are not authorized to cancel this booking.' });
        }

        const cancellableStatuses = ['Pending', 'Confirmed'];
        if (!cancellableStatuses.includes(booking.status)) {
            return res.status(400).json({
                success: false,
                error: `This booking cannot be cancelled because its status is "${booking.status}".`,
            });
        }

        const { data: updated, error: updateError } = await supabase
            .from('bookings')
            .update({ status: 'Cancelled' })
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw updateError;

        // Restore promo code if used
        if (booking.couponCode) {
            try {
                await decrementPromoUsage(booking.couponCode);
            } catch (pErr) {
                console.warn('⚠️ Could not restore promo code usage:', pErr.message || pErr);
            }
        }

        // Send cancellation confirmation email via Resend
        let emailSent = false;
        try {
            const targetEmail = booking.email || req.user?.email;
            if (targetEmail) {
                const recipient = resolveRecipient(targetEmail);
                const cancelEmailHtml = BookingCancelledEmail({
                    packageTitle: booking.package_title || 'Studio Session',
                    basePrice: booking.base_price || '₱0',
                    studio: booking.studio || 'Studio Suite',
                    date: booking.day_of_week && booking.booking_date 
                        ? `${booking.day_of_week}, ${booking.booking_date}` 
                        : booking.booking_date || 'Scheduled Date',
                    time: booking.booking_time || 'Scheduled Time',
                    addOns: Array.isArray(booking.add_ons) && booking.add_ons.length > 0 
                        ? booking.add_ons.join(', ') 
                        : 'None',
                    firstName: booking.firstName || 'Valued Guest',
                    lastName: booking.lastName || '',
                    phone: booking.phone || 'N/A',
                    email: targetEmail,
                    bookingId: booking.id,
                    paymentMode: booking.paymentMode,
                    reason: reason || null,
                });

                const emailResult = await sendEmail({
                    from: FROM_EMAIL,
                    to: [recipient],
                    subject: `Booking Cancelled - ${booking.package_title || 'Studio Session'}`,
                    html: cancelEmailHtml,
                });

                emailSent = emailResult.success;
            }
        } catch (emailErr) {
            console.error('⚠️ Booking cancelled, but cancellation email dispatch failed:', emailErr.message || emailErr);
        }

        return res.status(200).json({
            success: true,
            message: emailSent
                ? 'Booking cancelled successfully. A confirmation email has been sent.'
                : 'Booking cancelled successfully.',
            booking: updated,
            emailSent,
        });
    } catch (error) {
        console.error('❌ Error cancelling booking:', error);
        return res.status(500).json({ success: false, error: 'Failed to cancel booking.' });
    }
};

module.exports = { createBooking, getMyBookings, cancelBooking };