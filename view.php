<?php
include 'db.php';

$result = $conn->query("SELECT * FROM messages");

while ($row = $result->fetch_assoc()) {
    echo "<p><strong>" . $row['name'] . "</strong>: " . $row['message'] . "</p>";
}
?>