;(function() {
    var model = {
        students: [
            { name: 'Slappy the Frog' },
            { name: 'Lilly the Lizard' },
            { name: 'Paulrus the Walrus' },
            { name: 'Gregory the Goat' },
            { name: 'Adam the Anaconda' }
        ],
        init: function() {
            var students = this.students;
            var resetAttendance = [];
            var noOfDays = controller.getNoOfDays();
            for (var i = 0; i < noOfDays; i++) resetAttendance[i] = false;
            
            model.attendance = localStorage.attendance ? JSON.parse(localStorage.attendance) : {};
            
            for (var i = 0, l = students.length; i < l; i++) {
                if (!(model.attendance[students[i].name] && model.attendance[students[i].name].length == noOfDays))
                    model.attendance[students[i].name] = resetAttendance.slice();
                
                students[i].attendance = model.attendance[students[i].name];
            }
            
            localStorage.removeItem('attendance');
            localStorage.attendance = JSON.stringify(model.attendance);
        },
        attendanceUpdate: function(student, attendance) {
            student.attendance[attendance.day] = attendance.present;
            model.attendance[student.name] = student.attendance;
            
            localStorage.removeItem('attendance');
            localStorage.attendance = JSON.stringify(model.attendance);
        },
        noOfDays: 12
    };
    
    var controller = {
        init: function() {
            model.init();
            view.init();
        },
        getStudentsList: function() {
            return model.students;
        },
        getNoOfDays: function() {
            return model.noOfDays;
        },
        updateMissed: function(checkbox, missedCol, studentId, student, checkboxId) {
            var checked = (checkbox instanceof jQuery) ? checkbox.is(':checked') : checkbox.checked;
            model.attendanceUpdate(student, {day: checkboxId, present: checked});
            
            var missedDaysCount = 0;
            student.attendance.forEach(function(element) {
                if (!element) missedDaysCount++;
            });
            
            view.students.updateAttendace(missedCol, missedDaysCount);
        }
    };
    
    var view = {
        skeliton: {
            init: function() {
                var container = document.getElementsByClassName('container')[0];
                var table = document.createElement('table');
                var html = '<thead><tr><th class="name-col">Student Name</th>';
                
                for (var i = 1, noOfDays = controller.getNoOfDays(); i <= noOfDays; i++) {
                    html += '<th>' + i + '</th>';
                }
                
                html += '<th class="missed-col">Days Missed-col</th></tr></thead><tbody id="thebody"></tbody>';
                table.innerHTML = html;
                
                container.appendChild(table);
            }
        },
        students: {
            init: function() {
                // loop through all students and draw all student rows
                var students = controller.getStudentsList(), row, i;
                var theBody = document.querySelector('#thebody');
                for (i = 0, l = students.length; i < l; i++) {
                    row = view.students.drawRow(students[i]);
                    theBody.appendChild(row);
                }
                
                // Bind the input elements to event handlers : JQuery
                $('#thebody tr').each(function(index) {
                    var _thisRow = $(this);
                    var missedCol = $(this).find('.missed-col');

                    var students = controller.getStudentsList();
                    var studentId = index;
                    var student = students[studentId];

                    _thisRow.find('td.attend-col input').each((function(_thisRow, missedCol, studentId, student) {
                        return function(index) {
                            $(this).on('change', (function(_thisRow, missedCol, studentId, student, checkboxId){
                                return function(e) {
                                    var checkbox = $(this);
                                    controller.updateMissed(checkbox, missedCol, studentId, student, checkboxId);
                                };
                            }(_thisRow, missedCol, studentId, student, index)));
                        }
                    }(_thisRow, missedCol, studentId, student)));
                });
            },
            drawRow: function(student) {
                // given a student draw its row
                var row = document.createElement('tr');
                var html = '<td class="name-col">' + student.name + '</td>';
                var checked = '', absentDays = controller.getNoOfDays();
                for (var i = 1, noOfDays = absentDays; i <= noOfDays; i++) {
                    checked = '';
                    if (student.attendance[i - 1]) {
                        checked = 'checked';
                        absentDays--;
                    }
                    html += '<td class="attend-col"><input type="checkbox" ' + checked + '></td>';
                }
                html += '<td class="missed-col">' + absentDays + '</td>';
                row.innerHTML = html;
                
                return row;
            },
            updateAttendace: function(missedCol, value) {
                if (missedCol instanceof jQuery) missedCol.text(value);
                else missedCol.textContent = value;
                
                return true;
            }
        },
        init: function() {
            view.skeliton.init();
            view.students.init();
        }
    };
    
    controller.init();
}());