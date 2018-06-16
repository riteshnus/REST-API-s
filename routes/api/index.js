var router = require('express').Router({mergeParams: true}),
    apiController = require('../../controller/apiController');

// Routes
router.route('/registerteacher')
    .post(apiController.teacherRegistration)

router.route('/register')
    .post(apiController.studentRegistration)

router.route('/commonstudents')
    .get(apiController.commonStudents)

router.route('/suspend')
    .post(apiController.suspendStudent)

router.route('/retrievefornotifications')
    .post(apiController.retrievefornotification)

module.exports = router;
