<?php
include '../db/db.php';

if (isset($_POST['booking_date']) && isset($_POST['booking_time'])) {

    // 1. Collect ALL variables from POST
    $name = $_POST['name'] ?? '';
    $email = $_POST['email'] ?? '';
    $mobile = $_POST['mobile_number'] ?? '';
    $voucher = $_POST['voucher_code'] ?? '';
    $group_size = $_POST['group_size'] ?? 0;
    $package = $_POST['package'] ?? '';
    $pet = $_POST['pet_details'] ?? '';
    $backdrops = $_POST['backdrops'] ?? '';
    $hair_makeup = $_POST['hair_makeup'] ?? '';
    $spotify = $_POST['spotify_link'] ?? '';
    $allow_posting = $_POST['allow_posting'] ?? '';
    $source = $_POST['referral_source'] ?? '';
    $booking_date = $_POST['booking_date'];
    $booking_time = $_POST['booking_time'];

    // 2. Update the SQL to include ALL columns
    // Count carefully: 14 columns = 14 question marks
    $stmt = $conn->prepare("INSERT INTO bookings 
        (name, email, mobile_number, voucher_code, group_size, package, pet_details, backdrops, hair_makeup, spotify_link, allow_posting, referral_source, booking_date, booking_time) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    // 3. Update bind_param to match
    // "ssssisssssssss" means: string, string, string, string, integer (for group size), then the rest are strings
    $stmt->bind_param("ssssisssssssss", 
        $name, $email, $mobile, $voucher, $group_size, $package, 
        $pet, $backdrops, $hair_makeup, $spotify, $allow_posting, 
        $source, $booking_date, $booking_time
    );

    if ($stmt->execute()) {
        $stmt->close();
        $conn->close();
        header("Location: /successful-schedule.html");
        exit();
    } else {
        echo "Error: " . $stmt->error;
    }
}
$conn->close();
?>