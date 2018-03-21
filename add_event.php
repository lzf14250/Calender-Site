<?php
/*this php takes an json below:
  title:"",
  description:"",
  start_time:"",
  group:true/false,
  group_name:"",
  group_user:["","",""],
  token:""
*/
header("Content-Type: application/json");
require('database.php');

session_start();
$input_json = json_decode(file_get_contents("php://input"),true);
if (isset($_SESSION['username']) && $input_json['token'] == $_SESSION['token']) {
  //already login
  $group = $input_json['group'];
  $title = $input_json['title'];
  $description = $input_json['description'];
  $start_time = $input_json['start_time'];
  $group_name = $input_json['group_name'];
  $group_user = $input_json['group_user'];
  $groupuser_id = array();
  $user_id = $_SESSION['id'];

  if (empty($title)) {
    //title is empty
    echo json_encode(array(
      "success" => false,
      "message" => "title can not be empty!"
    ));
    exit;
  } else {
    //title not empty
    if (!$group) {
      //personal event
      $stmt = $mysqli->prepare("insert into events (user_id,title,description,start_time) values (?, ?, ?, ?)");
      $stmt->bind_param('isss',$user_id,$title,$description,$start_time);
      $stmt->execute();
      $stmt->close();
      echo json_encode(array(
        "success" => true,
        "message" => "successfully added!"
      ));
      exit;
    } else {
      //group event, insert into the event and get the group_id
      for($x=0;$x<count($group_user);$x++){
        $stmt = $mysqli->prepare("SELECT id FROM users WHERE username=?");
        $stmt->bind_param('s',$group_user[$x]);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $stmt->close();
        array_push($groupuser_id,$row["id"]);

        if (empty($row)) {
          //user not found
          echo json_encode(array(
            "success" => false,
            "message" => "some users not exist, please recheck!"
          ));
          exit;
        }
      }
      //insert the group event
      $stmt = $mysqli->prepare("insert into groups (group_name) values (?)");
      $stmt->bind_param('s',$group_name);
      $stmt->execute();
      $stmt->close();

      $stmt = $mysqli->prepare("select max(id) from groups");
      $stmt->execute();
      $result = $stmt->get_result();
      $row = $result->fetch_assoc();
      $stmt->close();

      $group_id = $row['max(id)'];

      for($x=0;$x<count($groupuser_id);$x++){
        //insert event to users
        $stmt = $mysqli->prepare("insert into events (user_id,title,description,start_time,group_id) values (?, ?, ?, ?, ?)");
        $stmt->bind_param('isssi',$groupuser_id[$x],$title,$description,$start_time,$group_id);
        $stmt->execute();
        $stmt->close();
      }
      echo json_encode(array(
        "success" => true,
        "message" => "group event successfully added!"
      ));
      exit;
  }
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
