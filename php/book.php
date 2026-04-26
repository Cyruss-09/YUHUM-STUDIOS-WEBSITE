<?php
include '../db/db.php';

if (isset($_POST['booking_date']) && isset($_POST['booking_time'])) {

    $name = $_POST['name'] ?? '';
    $email = $_POST['email'] ?? '';
    $mobile = $_POST['mobile_number'] ?? '';
    $voucher = $_POST['voucher_code'] ?? '';
    $group_size = $_POST['group_size'] ?? '';
    $package = $_POST['package'] ?? '';
    $pet = $_POST['pet_details'] ?? '';
    $backdrops = $_POST['backdrops'] ?? '';
    $hair_makeup = $_POST['hair_makeup'] ?? '';
    $spotify = $_POST['spotify_link'] ?? '';
    $allow_posting = $_POST['allow_posting'] ?? '';
    $source = $_POST['referral_source'] ?? '';

    // ✅ FIX HERE
    $booking_date = $_POST['booking_date'];
    $booking_time = $_POST['booking_time'];

    $sql = "INSERT INTO bookings 
    (name, email, mobile_number, voucher_code, group_size, package, pet_details, backdrops, hair_makeup, spotify_link, allow_posting, referral_source, booking_date, booking_time)
    VALUES 
    ('$name', '$email', '$mobile', '$voucher', '$group_size', '$package', '$pet', '$backdrops', '$hair_makeup', '$spotify', '$allow_posting', '$source', '$booking_date', '$booking_time')";

   if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // your insert code...

    if ($conn->query($sql) === TRUE) {

        header("Location: /successful-schedule.html");
        exit();

    } else {
        echo "Error: " . $conn->error;
    }
}

    $conn->close();
}
?>