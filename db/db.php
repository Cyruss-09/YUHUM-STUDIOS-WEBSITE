<?php
$conn = new mysqli("localhost", "root", "", "yuhum.studio.db");

if($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}
?>