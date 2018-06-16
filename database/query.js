const setUpDb = require('./setUpDb');
const constant = require('../constant');

exports.insertTeacher = (body) => {
    return new Promise((resolve, reject) => {
        setUpDb.connect();
        const query = 'INSERT INTO teachers("email") VALUES ($1) RETURNING email'
        const value = [body.teacher];

        setUpDb.query(query, value)
            .then(response => {
                resolve(response.rows)
            })
            .catch(err => {
                reject(err)
            })
    })
}

exports.registerStudent = (body) => {
    let count = 0;
    return new Promise((resolve, reject) => {
        setUpDb.connect();
        const query = 'Select email from students where email= $1'
        body.students.forEach(ele => {
            setUpDb.query(query, [ele])
                .then((res) => {
                    console.log('check student', res.rows.length)
                    if (res.rows.length === 0) {
                        this.insertStudent(ele)
                            .then(() => {})
                            .catch((err) => reject(err))
                    }

                    this.insertTeacherStudent(body.teacher, ele)
                        .then(() => {
                            count = count+1;
                            if(count === body.students.length) {
                                resolve()
                            }
                        })
                        .catch((err) => reject(err))
                })
                .catch(err => {
                    new Error('student can not insert')
                })
        })
    })
}

exports.insertStudent = (email) => {
    return new Promise((resolve, reject) => {
        setUpDb.connect();
        const query = 'INSERT INTO students("email","status") VALUES ($1, $2) RETURNING *'

        /*setUpDb.query(query, value)
            .then(response => {
                console.log('teacher success')
                this.insertStudent(body, () => {
                    resolve(response)
                })
            })
            .catch(err => {
                console.log('error', err);
                reject(err)
            })*/

        // body.students.forEach(ele => {
            setUpDb.query(query, [email, true])
                .then(() => {
                    console.log('student success')
                    /*count = count+1;
                    if(count === body.students.length) {
                        this.insertTeacherStudent(body, (msg)=>{
                            if(msg)
                                reject(msg)
                            else
                                resolve()
                        })
                    }*/
                    resolve();
                })
                .catch(err => {
                    reject(err)
                })
        })
    // })
}

/*exports.insertStudent = (body, callback) => {
    const studentsInsert = 'INSERT INTO students("email","status") VALUES ($1, $2) RETURNING *'
    let count = 0;
    body.students.forEach(ele => {
        setUpDb.query(studentsInsert, [ele, true])
            .then(() => {
                console.log('student success')
                count = count+1;
                if(count === body.students.length) {
                    this.insertTeacherStudent(body, ()=>{
                        callback()
                    })
                }
            })
            .catch(err => {
                console.log(err)
                // reject(err)
            })
    })
}*/

exports.insertTeacherStudent = (teacher,studentEmail) => {
    return new Promise((resolve, reject) => {
    const teachersStudentsInsert = 'INSERT INTO teachers_students("teacher_email", "student_email") VALUES ($1, $2) RETURNING *'
    let count = 0;
    // body.students.forEach(ele => {
        setUpDb.query(teachersStudentsInsert, [teacher, studentEmail])
            .then(() => {
                console.log('teachers_students success')
                /*count = count+1;
                if(count === body.students.length) {
                    callback()
                }*/
                resolve()
            })
            .catch(err => {
                // callback(err)
                reject(err)
            })
    })
}

exports.findCommonStudents = (params) => {
    return new Promise((resolve, reject) => {
        let type = Array.isArray(params);
        setUpDb.connect();
        let query = 'SELECT student_email from teachers_students WHERE teacher_email in ( \''+ params + '\' )'
        if(type){
            query = 'SELECT student_email from teachers_students WHERE teacher_email in ( \''+ params.join('\',\'') + '\' )'
        }
        findDup(query,type, (status, result) => {
            if(status === constant.success)
                resolve(result)
            else
                reject(result);
        })
    })
}

const findDup = (query, type, callback) => {
    let result = [];
    setUpDb.textQuery(query)
        .then(response => {
            console.log('findCommonStudents success ', response.rows)
            let queryResponseArray = response.rows.map(ele => ele.student_email)
            if(type){
                result = queryResponseArray.filter((ele,index)=>index!==queryResponseArray.indexOf(ele))}
            else {
                result = queryResponseArray
            }
            console.log('result', result)
            callback('success', result);
        })
        .catch(err => {
            callback('err', err);
        })
}

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
            .catch(err => {
                console.log('error', err);
                reject(err)
            })
    })
}

exports.findActiveStudent = function (body) {
    return new Promise((resolve, reject) => {
        setUpDb.connect();
        const query = 'SELECT * from students where status=$1 and email in (select student_email from teachers_students where teacher_email = $2)'
        const values = [true, body.teacher];

        setUpDb.query(query, values)
            .then(response => {
                resolve(response.rows.map(ele => ele.email))
            })
            .catch(err => {
                reject(err)
            })
    })
}

