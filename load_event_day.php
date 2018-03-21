<?php
/*need time stamp containing  three parameters:
 the year month and day
return json:
number:3,
title:["s","",""]
owner:["personal","personal","groupName"]
description:["s","",""]
start_time:["Y-m-d H:i:s","",""]
event_id:[i,i,i]                   */

header("Content-Type: application/json");
require('database.php');
session_start();
$input_json = json_decode(file_get_contents("php://input"),true);
if (isset($_SESSION['username']) && $input_json['token'] == $_SESSION['token']) {
   /*need edit
   !!!!!!!!!!!!!!!!!!!!!!!!!!!!
   !!!!!!!!!!!!!!!!!!!!!!!!!!!!*/
   $year = $input_json['year'];
   $month = $input_json['month'];
   $day = $input_json['day'];
   $user_id = $_SESSION['id'];
   $number = 0;
   $title = array();
   $owner = array();
   $description = array();
   $start_time = array();
   $event_id = array();

   //find all events the user has
   $stmt = $mysqli->prepare("SELECT * FROM events WHERE user_id=?");
   $stmt->bind_param('i',$user_id);
   $stmt->execute();
   $result = $stmt->get_result();

   while ($row = $result->fetch_assoc()) {

     $time = @strtotime($row["start_time"]);
     if (@date("Y",$time) == $year && @date("m",$time) == $month && @date("d",$time) == $day) {
       //match year and month, check if it's personal
       $number += 1;
       array_push($title,$row["title"]);
       array_push($description,$row["description"]);
       array_push($start_time,@date("Y-m-d H:i:s",$time));
       array_push($event_id,$row["id"]);

       if ($row["group_id"] == null) {
         //personal
         array_push($owner,"personal");
       } else {
         //group, get the group name
         $stmt_group = $mysqli->prepare("SELECT * FROM groups WHERE id=?");
         $stmt_group->bind_param('i',$row["group_id"]);
         $stmt_group->execute();
         $result_group = $stmt_group->get_result();
         $row_group = $result_group->fetch_assoc();
         array_push($owner,$row_group["group_name"]);
         $stmt_group->close();
       }
     }
   }
   $stmt->close();

   echo json_encode(array(
     "success" => true,
     "number" => $number,
     "title" => $title,
     "owner" => $owner,
     "description" => $description,
     "start_time" => $start_time,
     "event_id" => $event_id
   ));
   exit;
} else {
   echo json_encode(array(
     "success" => false,
     "message" => "please login!"
   ));
   exit;
 }
?>
