<?php
header("Content-Type: application/json");
require('database.php');

session_start();
$input_json = json_decode(file_get_contents("php://input"),true);
if (isset($_SESSION['username']) && $input_json['token'] == $_SESSION['token']) {
  $username = $input_json['username'];

  $stmt = $mysqli->prepare("SELECT * FROM users WHERE username=?");
  $stmt->bind_param('s',$username);
  $stmt->execute();
  $result = $stmt->get_result();
  $row = $result->fetch_assoc();
  $stmt->close();
  if (!empty($row)) {
    //username found
    echo json_encode(array(
      "success" => true,
      "message" => "user exists"
    ));
    exit;
  } else {
    //username not found
    echo json_encode(array(
      "success" => false,
      "message" => "user not exists"
    ));
  }
} else {
  echo json_encode(array(
    "success" => false,
    "message" => "please login!"
  ));
  exit;
}
?>
