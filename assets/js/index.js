$('.side-bar .nav-item .nav-link').mouseenter(function() {
    $(this).removeClass('link-dark')
    $(this).addClass('active')
}).mouseleave(function() {
    $(this).addClass('link-dark')
    $(this).removeClass('active')
})

let scriptDepartment = `<script src="./assets/js/department.js"></script>`
let scriptSubDepartment = `<script src="./assets/js/subDepartment.js"></script>`
let scriptLecturer = `<script src="./assets/js/lecturer.js"></script>`
let scriptSubject = `<script src="./assets/js/subject.js"></script>`
let scriptOffice = `<script src="./assets/js/office.js"></script>`
let scriptTopic = `<script src="./assets/js/topic.js"></script>`
let scriptQuestionCompilation = `<script src="./assets/js/questionCompilation.js"></script>`
let scriptExamCompilation = `<script src="./assets/js/examCompilation.js"></script>`
let scriptAccount = `<script src="./assets/js/account.js"></script>`

// xử lý hiển thị thông tin account hoặc nút đăng Nhập
$(document).ready(function() {

    let user = JSON.parse(sessionStorage.getItem("user"))
    let info = '';
    
    if (!user) {
        info = `<span id="loginButton">Đăng Nhập</span>`

        $('#infoContainer').empty().append(info)
    } else {
        info = `<span id="lecturerId">${user.lecturerId}</span>|<span id="lecturerName">${user.lecturerName}</span>`
        $('#info').append(info)
    }

    let roleId = user.account.role.roleId
    if (roleId == ID_SUB_DEPARTMENT_LEDER) {

        $.each($(".categoryItem").not("#topic"), function(index, element) {

            $(this).addClass('disabled')
        })
    } else if (roleId == ID_LECTURER) {

        $.each($(".categoryItem"), function(index, element) {

            $(this).addClass('disabled')
        })
    }

})

$(document).on('click', '#questionCompilation', function (e) {
    
    e.preventDefault()

    if (!$("head script[src='./assets/js/questionCompilation.js']").length) {
        $('head').append(scriptQuestionCompilation)
    }
    
    handleMenu('questionCompilation.html', initQuestionCompilation)
})

$(document).on('click', '#examCompilation', function (e) {
    
    e.preventDefault()

    if (!$("head script[src='./assets/js/examCompilation.js']").length) {
        $('head').append(scriptExamCompilation)
    }

    handleMenu('examCompilation.html', initExamCompilation)
})

$(document).on('click', '#changePassword', function (e) {
    
    e.preventDefault()

    if (!$("head script[src='./assets/js/account.js']").length) {
        $('head').append(scriptAccount)
    }

    handleMenu('changePassword.html', function(){})
})

$(document).on('click', '#loginButton', function () {
    $(location).prop('href', './login.html')
})

$(document).on('click', '#logout', function () {

    sessionStorage.clear()

    $(location).prop('href', './login.html')
})

$(document).on('click', '#department', function() {

    if (!$("head script[src='./assets/js/department.js']").length) {
        $('head').append(scriptDepartment)
    }

    handleMenu('department.html', initDepartment)
})

$(document).on('click', '#subDepartment', function() {

    if (!$("head script[src='./assets/js/subDepartment.js']").length) {
        $('head').append(scriptSubDepartment)
    }

    handleMenu('subDepartment.html', initSubDepartment)
})

$(document).on('click', '#lecturer', function() {

    if (!$("head script[src='./assets/js/lecturer.js']").length) {
        $('head').append(scriptLecturer)
    }
    
    handleMenu('lecturer.html', initLecturer)
})

$(document).on('click', '#subject', function() {

    if (!$("head script[src='./assets/js/subject.js']").length) {
        $('head').append(scriptSubject)
    }

    handleMenu('subject.html', initSubject)
})

$(document).on('click', '#office', function() {

    if (!$("head script[src='./assets/js/office.js']").length) {
        $('head').append(scriptOffice)
    }

    handleMenu('office.html', initOffice)
})

$(document).on('click', '#topic', function() {

    if (!$("head script[src='./assets/js/topic.js']").length) {
        $('head').append(scriptTopic)
    }

    handleMenu('topic.html', initTopic)
})

function handleMenu(src, callback) {

    $('#content').empty().load(src)

    callback()
}

$(document).on('change', '#ckbAll', function(e) {
    if ($('#ckbAll').is(":checked")) {
        $("input[name='delete']").prop('checked', true)
    } else {
        $("input[name='delete']").prop('checked', false)
    }
})

$(document).on('click', "input[name='delete']", function(e) {
    e.stopPropagation()
})