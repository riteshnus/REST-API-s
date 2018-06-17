/**
 * @Author Ritesh
 * @Date 6/16/2018
 * @Description: Controller class to handle request endpoints
 */

const query = require('../database/query');
const constant = require('../constant');

/**Teacher registration */
exports.teacherRegistration = (req, res, next) => {
    query.insertTeacher(req.body)
        .then(() => res.sendStatus(204))
        .catch(err => {
            console.log(err);
            let error = new Error(handleError(err));
            error.statusCode = 400;
            next(error)
        })
}

/**Student registration */
exports.studentRegistration = (req, res, next) => {
    query.registerStudent(req.body)
        .then(() => res.sendStatus(204))
        .catch(err => {
            let error = new Error(handleError(err));
            error.statusCode = 400;
            next(error)
        })
}

/**Common Students*/
exports.commonStudents = (req, res, next) => {
    query.findCommonStudents(req.query.teacher)
        .then(response => res.json({'students': response}))
        .catch(err => {
            let error = new Error(handleError(err));
            error.statusCode = 400;
            next(error)
        })
}

/**Suspend Student*/
exports.suspendStudent = (req, res, next) => {
    query.updateSuspend(req.body)
        .then(() => res.sendStatus(204))
        .catch(err => {
            let error = new Error(err);
            error.statusCode = 400;
            next(error)
        })
}

/**Notification list*/
exports.retrievefornotification = (req, res, next) => {
    query.findActiveStudent(req.body)
        .then(response => {
            req.body.notification.split(' ').forEach(ele => {
                if (ele.charAt(0) === constant.at)
                    response.push(ele.substring(1))
            })
            res.json({'recipients': response});
        })
        .catch(err => {
            let error = new Error(handleError(err));
            error.statusCode = 400;
            next(error)
        })
}

/**Handle error*/
const handleError = (err) => {
    let message;
    if (err.detail) {
        if (err.detail.includes('already exist')) {
            let dubEmail = err.detail.split(' ')[1].split('=')[1];
            message = 'Email \'' + dubEmail.substring(1, dubEmail.length - 1) + '\' already exist'
        }
    } else {
        message = 'server error'
    }
    return message;
}