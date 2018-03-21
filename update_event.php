<?php
/*this php receive an json containing
event_id, title, description, start_time,
token as parameter*/
header("Content-Type: application/json");
require('database.php');

session_start();
$input_json = json_decode(file_get_contents("php://input"),true);
if (isset($_SESSION['username']) && $input_json['token'] == $_SESSION['token']) {
  //already login and token is correct
  $title = $input_json['title'];
  $description = $input_json['description'];
  $start_time = $input_json['start_time'];
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
    $stmt = $mysqli->prepare("update events set title=?, description=?, start_time=? where id=?");
    $stmt->bind_param('sssi',$title,$description,$start_time,$event_id);
    $stmt->execute();
    $stmt->close();
    echo json_encode(array(
      "success" => true,
      "message" => "successfully updated!"
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
    "message" => "permission denied!"
  ));
  exit;
}

?>
