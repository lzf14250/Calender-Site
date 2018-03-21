//using several lines of code from https://www.awaimai.com/1627.html for jquery alert
var prompt = function (message, style, time)
{
    style = (style === undefined) ? 'alert-success' : style;
    time = (time === undefined) ? 1200 : time;
    $('<div>')
        .appendTo('body')
        .addClass('alert ' + style)
        .html(message)
        .show()
        .delay(time)
        .fadeOut();
};

var success_prompt = function(message, time)
{
    prompt(message, 'alert-success', time);
};

var fail_prompt = function(message, time)
{
    prompt(message, 'alert-danger', time);
};

$(document).ready(function(){
  var dateObj = new Date();
  var currentMonth = new Month(dateObj.getFullYear(),dateObj.getMonth());
  var monthStringArray = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var personalEventDays = [];
  var groupEventDays = [];
  var realFirstDay;
  var token="";
  var username="";
  $.ajaxSetup({
    async : false
  });

  function getMonthlyEvents(){
    personalEventDays = [];
    groupEventDays = [];
    if(username!==""){
      $.post("load_event_month.php",JSON.stringify({
        token: token,
        year: currentMonth.year,
        month: currentMonth.month+1
      }),function(data,status){
        if(status==="success"){
          if(data.success){
            personalEventDays = data.personal;
            groupEventDays = data.group;
          }else{
            fail_prompt(data.message,1500);
          }
        }else{
          fail_prompt("cannot get events",1500);
        }
      });
    }
  }
  function updateCalender(){
    getMonthlyEvents();
    $("#monthPointer").text(monthStringArray[currentMonth.month]);
    $("#yearPointer").text(currentMonth.year);
    var tables = $("td");
    var weeks = currentMonth.getWeeks();
    //alert(tables.length+"--"+weeks.length);
    while($("tr").length-1<weeks.length){
      //alert($("tr").length+"--"+weeks.length);
      $("table").append($("<tr></tr>").append($("<td></td>"),$("<td></td>"),$("<td></td>"),$("<td></td>"),$("<td></td>"),$("<td></td>"),$("<td></td>")));
      var tables = $("td");
    }
    while($("tr").length-1>weeks.length){
      $("tr:last").remove();
      var tables = $("td");
    }
    var i = 0;
    for(var w in weeks){
      var days = weeks[w].getDates();
      for(var d in days){
        $(tables[i]).unbind();
        $(tables[i]).removeClass();
        if(days[d].getDate()===1&&days[d].getMonth()===currentMonth.month){
          realFirstDay = i;
        }
        $(tables[i]).text(days[d].getDate());
        if(days[d].getMonth()!==currentMonth.month){
          $(tables[i]).addClass("not-this-month");
        }else{
          $(tables[i]).addClass("this-month");
          if(personalEventDays.indexOf(i-realFirstDay+1)!==-1){
            $(tables[i]).addClass("personal-event");
          }
          if(groupEventDays.indexOf(i-realFirstDay+1)!==-1){
            $(tables[i]).addClass("group-event");
          }
          if(personalEventDays.indexOf(i-realFirstDay+1)!==-1&&groupEventDays.indexOf(i-realFirstDay+1)!==-1){
            $(tables[i]).addClass("both-event");
          }
          if(username!==""){
            $(tables[i]).click((function(day){
              return function(){
                $.post("load_event_day.php",JSON.stringify({
                  token: token,
                  year: day.getFullYear(),
                  month: day.getMonth()+1,
                  day: day.getDate()
                }),function(data,status){
                  if(status==="success"){
                    if(data.success){
                      $("#eventDialog").empty();
                      $("#eventDialog").dialog({
                        width:500,
                        maxHeight:600,
                        title:"events on "+monthStringArray[day.getMonth()]+" "+day.getDate()+", "+day.getFullYear(),
                        position:{my:"center top-300",of:window}
                      });
                      $("#eventDialog").append($("<p></p>").addClass("eventAddP").append($("<button>").text("add event").addClass("eventAdd").attr("id","eventAddButton")));
                      $("#eventAddButton").unbind("click").click(function(){
                        var members=[];
                        $("#eventAddDialog").empty();
                        $("#eventAddDialog").dialog({
                          width:500,
                          maxHeight:600,
                          title:"add event on "+monthStringArray[day.getMonth()]+" "+day.getDate()+", "+day.getFullYear(),
                          position:{my:"center top-300",of:window}
                        });
                        $("#eventAddDialog").append($("<input>").attr({
                          "id":"addTitle",
                          "type":"text",
                          "name":"eventTitle",
                          "placeholder":"title"
                        }));
                        $("#eventAddDialog").append($("<textarea></textarea").attr({
                          "id":"addDes",
                          "name":"eventDes",
                          "rows":"10",
                          "cols":"50",
                          "placeholder":"description"
                        }));
                        $("#eventAddDialog").append($("<input>").attr({
                          "id":"alarm",
                          "type":"text"
                        }));
                        $( "#alarm" ).timeDropper();
                        $("#eventAddDialog").append($("<button>").text("add member").addClass("addEventMember").attr("id","addEventMember"));
                        $("#addEventMember").unbind("click").click(function(){
                          $("#memberAddDialog").dialog({
                            width:450
                          });
                          $("#addMemberButton").unbind("click").click(function(){
                            if($("#newMember").val()!==""){
                              $.post("check_user.php",JSON.stringify({
                                token:token,
                                username:$("#newMember").val()
                              }),function(data,status){
                                if(status==="success"){
                                  if(data.success){
                                    $("#memberAddDialog").dialog("close");
                                    $("#alarm").after($("<p></p>").text($("#newMember").val()).css({
                                      "display":"block",
                                      "color":"#0082dd",
                                      "fontSize":"15px"
                                    }));
                                    members.push($("#newMember").val());
                                    $("#newMember").val("");
                                    $("#alarm").after($("<input>").attr({
                                      "placeholder":"group name",
                                      "id":"groupName"
                                    }));
                                  }else{
                                    fail_prompt("no such user",1500);
                                  }
                                }else{
                                  fail_prompt("server error",1500);
                                }
                              });
                            }else{
                              fail_prompt("username should not be empty",1500);
                            }
                          });
                        });
                        $("#eventAddDialog").append($("<button>").text("add event").addClass("eventAdd").attr("id","confirmEventAdd"));
                        $("#confirmEventAdd").unbind("click").click(function(){
                          if(members.length===0){
                            if($("#addTitle").val()!==""&&$("#addDes").val()!==""){
                              $.post("add_event.php",JSON.stringify({
                                token:token,
                                title:$("#addTitle").val(),
                                description:$("#addDes").val(),
                                group:false,
                                group_name:"",
                                group_user:[],
                                start_time:day.getFullYear()+"-"+(day.getMonth()+1)+"-"+day.getDate()+" "+$( "#alarm" ).val()+":00 UTC"
                              }),function(data,status){
                                if(status==="success"){
                                  if(data.success){
                                    success_prompt("add event successfully",1500);
                                    $("#eventAddDialog").dialog("close");
                                    $("#eventDialog").dialog("close");
                                    updateCalender();
                                  }else{
                                    fail_prompt(data.message,1500);
                                  }
                                }else{
                                  fail_prompt("server error",1500);
                                }
                              });
                            }else{
                              fail_prompt("input fields should not be empty",1500);
                            }
                          }else{
                            if($("#addTitle").val()!==""&&$("#addDes").val()!==""&&$("#groupName").val()!==""){
                              members.push(username);
                              $.post("add_event.php",JSON.stringify({
                                token:token,
                                title:$("#addTitle").val(),
                                description:$("#addDes").val(),
                                group:true,
                                group_name:$("#groupName").val(),
                                group_user:members,
                                start_time:day.getFullYear()+"-"+(day.getMonth()+1)+"-"+day.getDate()+" "+$( "#alarm" ).val()+":00 UTC"
                              }),function(data,status){
                                if(status==="success"){
                                  if(data.success){
                                    success_prompt("add event successfully",1500);
                                    $("#eventAddDialog").dialog("close");
                                    $("#eventDialog").dialog("close");
                                    updateCalender();
                                  }else{
                                    fail_prompt(data.message,1500);
                                  }
                                }else{
                                  fail_prompt("server error",1500);
                                }
                              });
                            }else{
                              fail_prompt("input fields should not be empty",1500);
                            }
                          }

                        });
                      });
                      if(data.number===0){
                        $("#eventDialog").append("no events today");
                      }else{
                        for(var i = 0;i<data.number;i++){
                          $("#eventDialog").append($("<p></p>").text(data.title[i]).addClass("eventTitle").attr("id","event"+i));
                          $("#eventDialog").append($("<p></p>").text(data.description[i]).addClass("eventDes"));
                          $("#eventDialog").append($("<p></p>").text(data.start_time[i]).addClass("eventTime"));
                          $("#eventDialog").append($("<p></p>").text(data.owner[i]).addClass("eventOwner"));
                          $("#event"+i).click((function(i){
                            return function(){
                              $("#modTitle").val(data.title[i]);
                              $("#modDes").text(data.description[i]);
                              var t = data.start_time[i].split(/(\d\d)/);
                              $("#modAlarm").timeDropper({
                                modifyTime:true,
                                hour:parseInt(t[9]),
                                minute:parseInt(t[11])
                              });
                              $("#modAlarm").val(t[9]+":"+t[11]);
                              $("#modOwner").text(data.owner[i]);
                              $("#modSubmit").unbind("click").click(function(){
                                if($("#modTitle").val()!==""&&$("#modDes").val()!==""){
                                  $.post("update_event.php",JSON.stringify({
                                    token:token,
                                    id:data.event_id[i],
                                    title:$("#modTitle").val(),
                                    description:$("#modDes").val(),
                                    start_time:day.getFullYear()+"-"+(day.getMonth()+1)+"-"+day.getDate()+" "+$( "#modAlarm" ).val()+":00 UTC"
                                  }),function(data,status){
                                    if(status==="success"){
                                      if(data.success){
                                        success_prompt("modify successfully",1500);
                                        $("#eventModifyDialog").dialog("close");
                                        $("#eventDialog").dialog("close");
                                        updateCalender();
                                      }else{
                                        fail_prompt(data.message,1500);
                                      }
                                    }else{
                                      fail_prompt("server error",1500);
                                    }
                                  });
                                }else{
                                  fail_prompt("input fields should not be empty",1500);
                                }
                              });
                              $("#modDelete").unbind("click").click(function(){
                                $.post("delete_event.php",JSON.stringify({
                                  token:token,
                                  id:data.event_id[i]
                                }),function(data,status){
                                  if(status==="success"){
                                    if(data.success){
                                      success_prompt("delete successfully",1500);
                                      $("#eventModifyDialog").dialog("close");
                                      $("#eventDialog").dialog("close");
                                      updateCalender();
                                    }else{
                                      fail_prompt(data.message,1500);
                                    }
                                  }else{
                                    fail_prompt("server error",1500);
                                  }
                                });
                              });
                              $("#eventModifyDialog").dialog({
                                width:450,
                                height:450
                              });
                            };
                          })(i));
                        }
                      }
                    }else{
                      fail_prompt(data.message,1500);
                    }
                  }else{
                    fail_prompt("server error",1500);
                  }
                });
              };
            })(days[d]));
          }
        }
        i++;
      }
    }
  }
  updateCalender();
  $("#prev_month").click(function(){
    currentMonth = currentMonth.prevMonth();
    updateCalender();
  });
  $("#next_month").click(function(){
    currentMonth = currentMonth.nextMonth();
    updateCalender();
  });
  $("#login").click(function(){
    $("#loginDialog").dialog({
      buttons: [
        {
          text: "Log in",
          click: function() {
            var usernameDOM = this.getElementsByTagName("input")[0];
            var passwordDOM = this.getElementsByTagName("input")[1];
            $.post("login_ajax.php",JSON.stringify({
              username: $(usernameDOM).val(),
              password: $(passwordDOM).val()
            }),function(data,status){
              if(status==="success"){
                if(data.success){
                  username = $(usernameDOM).val();
                  token = data.token;
                  $("#login").addClass("hidden");
                  $("#signup").addClass("hidden");
                  $("#user").text(username).removeClass("hidden");
                  $("#logout").removeClass("hidden");
                  $("#loginDialog").dialog("close");
                  updateCalender();
                  success_prompt("log in successfully",1500);
                }else{
                  fail_prompt(data.message,1500);
                }
              }else{
                fail_prompt("log in error",1500);
              }
            });
          }
        }
      ]
    });
  });
  $("#logout").click(function(){
    $.get("logout.php",function(data,status){
      if(status==="success"){
        if(data.success){
          username="";
          token = "";
          $("#login").removeClass("hidden");
          $("#signup").removeClass("hidden");
          $("#user").text(username).addClass("hidden");
          $("#logout").addClass("hidden");
          updateCalender();
          success_prompt("log out successfully",1500);
        }else{
          fail_prompt(data.message,1500);
        }
      }else{
        fail_prompt("log out error",1500);
      }
    });
  })
  $("#signup").click(function(){
    $("#signupDialog").dialog({
      buttons: [
        {
          text: "sign up",
          click: function() {
            var usernameDOM = this.getElementsByTagName("input")[0];
            var passwordDOM1 = this.getElementsByTagName("input")[1];
            var passwordDOM2 = this.getElementsByTagName("input")[2];
            if($(usernameDOM).val()===""){
              fail_prompt("username cannot be null",1500);
            }else if($(passwordDOM1).val()===""||$(passwordDOM2).val()===""){
              fail_prompt("password cannot be null",1500);
            }else if($(passwordDOM1).val()!==$(passwordDOM2).val()){
              fail_prompt("passwords are inconsistent",1500);
            }else{
              $.post("signup_ajax.php",JSON.stringify({
                username: $(usernameDOM).val(),
                password: $(passwordDOM1).val()
              }),function(data,status){
                if(status==="success"){
                  if(data.success){
                    $("#login").addClass("hidden");
                    $("#signup").addClass("hidden");
                    $("#user").text(username).removeClass("hidden");
                    $("#logout").removeClass("hidden");
                    $("#signupDialog").dialog("close");
                    success_prompt("sign up successfully",1500);
                  }else{
                    fail_prompt(data.message,1500);
                  }
                }else{
                  fail_prompt("sign up error",1500);
                }
              });
            }
          }
        }
      ]
    });
  });
});
