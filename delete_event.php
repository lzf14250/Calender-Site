<?php
//this php receive an json containing event_id as parameter
header("Content-Type: application/json");
require('database.php');

session_start();
$input_json = json_decode(file_get_contents("php://input"),true);
if (isset($_SESSION['username']) && $input_json['token'] == $_SESSION['token']) {
  //already login

  $event_id = $input_json['id'];
  //check if this event belongs to the login user
  $stmt = $mysqli->prepare("SELECT * FROM events WHERE id=?");
  $stmt->bind_param('i',$event_id);
  $stmt->execute();
  $result = $stmt->get_result();
  $row = $result->fetch_assoc();
  $stmt->close();
  if ($_SESSION['id'] == $row['user_id']) {
    //successfully match
    $stmt = $mysqli->prepare("delete from events where id=?");
    $stmt->bind_param('i',$event_id);
    $stmt->execute();
    $stmt->close();
    echo json_encode(array(
      "success" => true,
      "message" => "successfully deleted!"
    ));
    exit;
  } else {
    //not match
    echo json_encode(array(
      "success" => false,
      "message" => "permission denied!"
    ));
    exit;
  }

} else {
  //not login
  echo json_encode(array(
    "success" => false,
    "message" => "please login!"
  ));
  exit;
}

?>
