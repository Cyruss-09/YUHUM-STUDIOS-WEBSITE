const { supabase } = require('../config/supabase');

const DEFAULT_SETTINGS = {
    general: {
        studioName: "Yuhum Studios",
        contactEmail: "yuhumstudios22@gmail.com",
        phone: "+63 912 345 6789",
        address: "Iloilo City, Philippines",
        googleMapsUrl: "https://maps.google.com",
    },
    schedule: {
        openTime: "10:00 AM",
        closeTime: "06:00 PM",
        slotDurationMinutes: 30,
        bufferMinutes: 15,
        studioAActive: true,
        studioBActive: true,
        blackoutDates: [],
    },
    packages: {
        kadlawPrice: 649,
        gugmaPrice: 1499,
        addOns: [
            { key: "add_head", label: "+1 adult", price: 250 },
            { key: "add_pet", label: "+1 pet", price: 100 },
            { key: "add_4r_print", label: "+1 4R Print", price: 50 },
            { key: "add_grid_strips", label: "+1 2x Photo Grid Strips", price: 50 },
            { key: "raw_photos", label: "All Raw Photos", price: 400 },
            { key: "hair_makeup", label: "Hair & Makeup Service", price: 2500 },
            { key: "studio_rental", label: "Rental Studio (Rate is per hour)", price: 1000 },
        ],
    },
    payments: {
        gcashName: "YUHUM STUDIOS",
        gcashNumber: "0912 345 6789",
        mayaName: "YUHUM STUDIOS",
        mayaNumber: "0912 345 6789",
        bankName: "BPI",
        bankAccountName: "Yuhum Studios Inc.",
        bankAccountNumber: "1234-5678-90",
        downpaymentType: "full",
        paymentInstructions:
            "Please send proof of payment / screenshot to yuhumstudios22@gmail.com or via Instagram DM @yuhumstudios.",
    },
    cms: {
        bannerEnabled: false,
        bannerText: "✨ Welcome to Yuhum Studios! Book your self-shoot session today.",
        bannerTheme: "dark",
        maintenanceMode: false,
        maintenanceMessage:
            "Our booking system is currently undergoing scheduled maintenance. We will be back shortly!",
    },
};

const getPublicSettings = async (req, res) => {
    try {
        const { data: dbSettings, error } = await supabase
            .from('studio_settings')
            .select('setting_key, setting_value');

        if (error) {
            console.error('Error fetching settings from Supabase:', error.message);
            return res.json({ success: true, settings: DEFAULT_SETTINGS });
        }

        const settingsMap = { ...DEFAULT_SETTINGS };
        if (dbSettings && dbSettings.length > 0) {
            dbSettings.forEach((row) => {
                settingsMap[row.setting_key] = row.setting_value;
            });
        }

        return res.status(200).json({ success: true, settings: settingsMap });
    } catch (err) {
        console.error('Unexpected error in getPublicSettings:', err);
        return res.status(200).json({ success: true, settings: DEFAULT_SETTINGS });
    }
};

module.exports = {
    getPublicSettings,
};