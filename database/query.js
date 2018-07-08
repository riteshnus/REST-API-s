/**
 * @Author Ritesh
 * @Date 6/16/2018
 * @Description: Query calls
 */

const setUpDb = require('./setUpDb');
const constant = require('../constant');

/** Query to insert teacher */
exports.insertTeacher = (body) => {
    return new Promise((resolve, reject) => {
        setUpDb.connect();
        const query = 'INSERT INTO teachers("email") VALUES ($1) RETURNING email'
        const value = [body.teacher];

        setUpDb.query(query, value)
            .then(response => resolve(response.rows))
            .catch(err => reject(err))
    })
}

/** Query to register student, response only send when loop completed */
exports.registerStudent = (body) => {
    let count = 0;
    return new Promise((resolve, reject) => {
        setUpDb.connect();
        checkTeacher(body.teacher)
            .then((rowCount) => {
                    if (rowCount === 0) {
                        console.log('no teacher exist')
                        reject('no teacher exist')
                    } else {
                        console.log('teacher exist')
                        body.students.forEach(ele => {
                            console.log('check student: ', ele)
                            checkStudent(ele)
                                .then((rowCount) => {
                                    if (rowCount === 0) {
                                        console.log('no student, insert student')
                                        insertStudent(ele)
                                            .then(() => {
                                                insertTeacherStudent(body.teacher, ele)
                                                    .then(() => {
                                                        console.log('insert teacher_student table');
                                                        count = count + 1;
                                                        /*if(count === body.students.length) {
                                                            resolve()
                                                        }*/
                                                        (count === body.students.length ? resolve() : '')
                                                    })
                                                    .catch(err => reject(err))
                                            })
                                            .catch(err => reject(err))
                                    } else {
                                        console.log('student exist')
                                        checkStudentUnderTeacher(ele, body.teacher)
                                            .then((rowCount) => {
                                                console.log('check student_teacher row exist')
                                                if (rowCount === 0) {
                                                    console.log('check student_teacher row === 0')
                                                    insertTeacherStudent(body.teacher, ele)
                                                        .then(() => {
                                                            console.log('insert teacher_student table');
                                                            count = count + 1;
                                                            (count === body.students.length ? resolve() : '')
                                                        })
                                                        .catch(err => reject(err))
                                                } else {
                                                    console.log('check student_teacher row === 1')
                                                    count = count + 1;
                                                    (count === body.students.length ? resolve() : '')
                                                }
                                            })
                                            .catch()
                                    }
                                })
                                .catch()
                        })
                    }
                })
            .catch()
    })
}

/** check Teacher exist in database */
const checkTeacher = (teacherEmail) => {
    return new Promise((resolve, reject) => {
        const query = 'Select * from teachers where email= $1'
        setUpDb.query(query, [teacherEmail])
            .then((res) => {
                resolve(res.rows.length)
            })
            .catch(err => {
                reject(err)
            })
    })
}

/** check Student existence in table */
const checkStudent = (studentEmail) => {
    return new Promise((resolve, reject) => {
        const query = 'Select * from students where email= $1'
        setUpDb.query(query, [studentEmail])
            .then((res) => {
                resolve(res.rows.length)
            })
            .catch(err => {
                reject(err)
            })
    })
}

/** check Teacher exist in database */
const checkStudentUnderTeacher = (studentEmail, teacherEmail) => {
    return new Promise((resolve, reject) => {
        const query = 'select  from teachers_students where teacher_email = $1 and student_email = $2'
        setUpDb.query(query, [teacherEmail,studentEmail])
            .then((res) => {
                resolve(res.rows.length)
            })
            .catch(err => {
                reject(err)
            })
    })
}

/** Query to insert student*/
const insertStudent = (email) => {
    return new Promise((resolve, reject) => {
        setUpDb.connect();
        const query = 'INSERT INTO students("email","status") VALUES ($1, $2) RETURNING *'

            setUpDb.query(query, [email, true])
                .then(() => resolve())
                .catch(err => reject(err))
        })
}

/** Query to insert teacher student table*/
const insertTeacherStudent = (teacher,studentEmail) => {
    return new Promise((resolve, reject) => {
    const teachersStudentsInsert = 'INSERT INTO teachers_students("teacher_email", "student_email") VALUES ($1, $2) RETURNING *'
        setUpDb.query(teachersStudentsInsert, [teacher, studentEmail])
            .then(() => resolve())
            .catch(err => reject(err))
    })
}

/** Query to find common students */
exports.findCommonStudents = (params) => {
    return new Promise((resolve, reject) => {
        let type = Array.isArray(params);
        findStudentsTeacher(type, params, (status,result) => {
            if(status === constant.success)
                resolve(result)
            else
                reject(reject)
        })
    })
}

/** Query for student teacher mapping, response only send when loop completed*/
const findStudentsTeacher = (type, params,callback) => {
    let query = 'SELECT student_email from teachers_students WHERE teacher_email in ';
    let result = [], count = 0;
    setUpDb.connect();
    if(type){
        params.forEach(ele => {
            setUpDb.textQuery(query+'( \''+ ele + '\')')
                .then(res => {
                    result.push(res.rows.map(ele => ele.student_email))
                    count = count+1;
                    if(count === params.length) {
                        callback('success',findIntersection(result))
                    }
                })
                .catch(err => callback('fail',err))
        })
    }else {
        setUpDb.textQuery(query+'( \''+ params + '\')')
            .then(res => callback('success',res.rows.map(ele => ele.student_email)))
            .catch()
    }
}

/** Method to intersection values in array of array*/
const findIntersection= (arrays) => {
        var copyArray = arrays.slice(),
            baseArray = copyArray.pop();

        return baseArray.filter(function(item) {
            return copyArray.every(function(itemList) {
                return itemList.indexOf(item) !== -1;
            });
        });
}

/** suspend the students */
exports.updateSuspend = function (body) {
    return new Promise((resolve, reject) => {
        setUpDb.connect();
        const query = 'UPDATE students set status=$1 where email=$2'
        const values = [false, body.student];

        setUpDb.query(query, values)
            .then(response => {
                if(response.rowCount>0)
                    resolve();
                else
                    reject('student didn\'t found');
            })
            .catch(err => reject(err))
    })
}

/** find active students for notification*/
exports.findActiveStudent = function (body) {
    return new Promise((resolve, reject) => {
        setUpDb.connect();
        const query = 'SELECT * from students where status=$1 and email in (select student_email from teachers_students where teacher_email = $2)'
        const values = [true, body.teacher];

        setUpDb.query(query, values)
            .then(response => resolve(response.rows.map(ele => ele.email)))
            .catch(err => reject(err))
    })
}

