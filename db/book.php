<?php
include 'db.php';

if (isset($_POST['submit'])) {

    $name = $_POST['name'];
    $email = $_POST['email'];
    $mobile = $_POST['mobile_number'];
    $voucher = $_POST['voucher_code'];
    $group_size = $_POST['group_size'];
    $package = $_POST['package'];
    $pet = $_POST['pet_details'];
    $backdrop = $_POST['backdrop'];
    $hair_makeup = $_POST['hair_makeup'];
    $spotify = $_POST['spotify_link'];
    $allow_posting = $_POST['allow_posting'];
    $source = $_POST['referral_source'];

    // ✅ NEW DATA
    $booking_date = $_POST['booking_date'];
    $booking_time = $_POST['booking_time'];

    $sql = "INSERT INTO bookings 
    (name, email, mobile_number, voucher_code, group_size, package, pet_details, backdrop, hair_makeup, spotify_link, allow_posting, referral_source, booking_date, booking_time)
    VALUES 
    ('$name', '$email', '$mobile', '$voucher', '$group_size', '$package', '$pet', '$backdrop', '$hair_makeup', '$spotify', '$allow_posting', '$source', '$booking_date', '$booking_time')";

    if ($conn->query($sql) === TRUE) {
       header("Location: successful-schedule.html");
       exit();
    } else {
        echo "❌ Error: " . $conn->error;
    }

    $conn->close();
}
?>