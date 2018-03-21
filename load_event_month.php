<?php
/*need two parameters: year, month
return json:
personal:[day,day,day]
group:[d,d,d]                   */
header("Content-Type: application/json");
require('database.php');

session_start();
$input_json = json_decode(file_get_contents("php://input"),true);
if (isset($_SESSION['username']) && $input_json['token'] == $_SESSION['token']) {
   //already login
   $year = intval($input_json['year']);
   $month = intval($input_json['month']);
   $user_id = $_SESSION['id'];
   $personal = array();
   $group = array();

   //find all events the user has
   $stmt = $mysqli->prepare("SELECT start_time, group_id FROM events WHERE user_id=?");
   $stmt->bind_param('i',$user_id);
   $stmt->execute();
   $result = $stmt->get_result();
   while ($row = $result->fetch_assoc()) {

     $time = @strtotime($row["start_time"]);
     if (intval(@date("Y",$time)) == $year && intval(@date("m",$time)) == $month) {
       //match year and month, check if it's personal

       if ($row["group_id"] == null) {
         //personal
         if (!in_array(intval(@date("d",$time)),$personal)) {
           //the day is new
           array_push($personal,intval(@date("d",$time)));
         }
       } else {
         //group

         if (!in_array(intval(@date("d",$time)),$group)) {
           //the day is new
           array_push($group,intval(@date("d",$time)));
         }
       }
     }
   }
   $stmt->close();

   echo json_encode(array(
     "success" => true,
     "message" => "successfully load!",
     "personal" => $personal,
     "group" => $group
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
