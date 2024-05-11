// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "XXX",
  authDomain: "XXX",
  databaseURL: "XXX",
  projectId: "XXX",
  storageBucket: "XXX",
  messagingSenderId: "XXX",
  appId: "XXX",
  measurementId: "XXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

import {getDatabase, ref, set, get, child, update, remove, push} 
from "https://www.gstatic.com/firebasejs/9.9.3/firebase-database.js";

const db = getDatabase();






function extractCourse(course){
    const trimmedCourse = course.trim();
    let courseCode = trimmedCourse.substring(0, 8);
    let semester = trimmedCourse.substring(30, 31);
    let teacher = trimmedCourse.substring(32);

    return {courseCode, semester, teacher};
}

function collectForm(){
    let name = $("#name").val();
    let courses = $("#courses").val();

    $("#name").val("");
    $("#courses").val("");

    if (name.trim().length === 0 || courses.trim().length === 0){
        return;
    }

    const courseListing = courses.split("\n");
    //console.log(courseListing);
    
    send_to_firebase(courseListing, name);
}

window.onload = function() {
    var submit = document.getElementById("submit");
    submit.onclick = collectForm;
}

//console.log(document.querySelector('#name').value)

function send_to_firebase(courseList, student) {
    
    const dbRef = ref(getDatabase());
    // for each course
    for (let i = 0; i < courseList.length; i++) {
        // check if the course is already in database
        
        let courseLink = 'Courses/' + courseList[i];
      
        let ValidateStart = courseList[i].substring(0, 3);
        let ValidateNums = courseList[i].substring(3, 4);
        let ValidateStartTwo = courseList[i].substring(4, 6);
        let ValidateDash = courseList[i].substring(6, 7);
        let ValidateNum = courseList[i].substring(7, 8);
        let ValidateConstant = courseList[i].substring(8, 30);
        let validateSem = courseList[i].substring(30, 31);
        let ValidateDashes = courseList[i].substring(31, 32)
        
        if (ValidateStart !== ValidateStart.toUpperCase()) {
            return;
        } else if (!/^[0-9]+$/.test(ValidateNums)) {
            return;
        } else if (ValidateStartTwo !== ValidateStartTwo.toUpperCase()){
            return;
        } else if (ValidateDash !== "-"){
            return;
        } else if (!/^[0-9]+$/.test(ValidateNum)){
            return;
        } else if (ValidateConstant !== "_W A Porter CI-2223Sem") {
            return;
        } else if (validateSem !== "1" && validateSem !== "2"){
            return;
        } else if (ValidateDashes !== "-"){
            return;
        }

        get(child(dbRef, courseLink)).then((snapshot) => {
            if (snapshot.exists()) {
                //console.log(snapshot.val());
                
                const postListRef = ref(db, courseLink);
                const newPostRef = push(postListRef);
                
                set(newPostRef, {
                    studentName: student
                });

                console.log("Added new student");
            } else {
                const postListRef = ref(db, courseLink);
                const newPostRef = push(postListRef);
                
                set(newPostRef, {
                    studentName: student
                });
                console.log("Added new course");
                
            }
        }).catch((error) => {
            console.error(error);
        });

    }

    // for each course
        // check if course is already in database
            // if course is already in data base append name under it
            // else create the course and then append the name under it
    
}

function collectCourses(){
    const dbRef = ref(getDatabase());
    get(child(dbRef, 'Courses')).then((snapshot) => {

        const nameCourse = $('#nameCourse').val();
        //console.log(nameCourse);

        snapshot.forEach(function(trialSnapshot) {

            let verified = false;
           
            const courseInfo = extractCourse(trialSnapshot.key);
            if (courseInfo['courseCode'].substring(0, nameCourse.length).toUpperCase() === nameCourse.toUpperCase()){
                verified = true;
            }
            //console.log(courseInfo);

            //$("#allCourses").append ('<tr><td>' + courseInfo['courseCode'] + '</td> <td>' + courseInfo['semester'] + '</td> <td>'
            //+ courseInfo['teacher'] + '</td> <td id="' + courseInfo['courseCode'] + 'Student"</tr>');



            var userName = trialSnapshot.val();
            //console.log(trialSnapshot.key);
            //console.log(userName);

            let allStudentsInClass = [];
            for (const key in userName) {
                //console.log(key);
                //console.log(userName[key][studentName])
                if (userName[key]['studentName'].substring(0, nameCourse.length).toUpperCase() === nameCourse.toUpperCase()){
                    verified = true;
                }
                allStudentsInClass.push(userName[key]['studentName']);
                

                //console.log(userName[key]['studentName']);
            }

            //console.log(allStudentsInClass);
            //console.log(allStudentsInClass.join());

            //console.log(courseInfo['courseCode'] + 'Student');
            if (verified === true){
                $("#allCourses").append ('<tr><td>' + courseInfo['courseCode'] + '</td> <td>' + courseInfo['semester'] + '</td> <td>'
                + courseInfo['teacher'] + '</td> <td id="' + courseInfo['courseCode'] + 'Student"</tr>');
                $("#" + courseInfo['courseCode'] + 'Student').append(allStudentsInClass.join(", "));
            }
            
            /*
            userName.forEach(function(actualStudent) {
                
            });
            */
        });
        

        //console.log(snapshot.val());
        
    }).catch((error) => {
        console.error(error);
    });

}


collectCourses();

document.getElementById("nameCourse").addEventListener("input", function () {
    $("#allCourses").empty();
    collectCourses();
});