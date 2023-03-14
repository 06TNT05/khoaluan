// get list danh muc
function findAllObjects(url, callback) {

    $.ajax({
        url: `${url}/find.all`,
        type: 'GET',
        dataType: 'json',
        data: {
            token: TOKEN,
            role: ROLE
        }
    }).done(function (data, status, xhr) {

        if (xhr.status == OK) {
            callback(data)
        }
    }).fail(function () {
        console.log("failed")
    });
}


// get list danh muc co phan trang
function findAllObjectsPagination(url, page, searchString, callback) {

    $.ajax({
        url: `${url}/find.all.pagination`,
        type: 'GET',
        dataType: 'json',
        data: {
            page: page,
            searchString: searchString,
            lecturerId: LECTURER_ID,
            token: TOKEN,
            role: ROLE
        }
    }).done(function (data, status, xhr) {

        if (xhr.status == OK) {
            
            callback(data)

            disableButtonPagination()
        }
    }).fail(function (resp) {
        console.log("failed")      
    });
}

// ham lay tong cac ban ghi
function getTotalRecord(url, keyItem) {

    let searchString = sessionStorage.getItem(keyItem)

    $.ajax({
        url: `${url}/getTotalRecord`,
        type: 'GET',
        dataType: 'json',
        data: {
            searchString: searchString,
            lecturerId: LECTURER_ID,
            token: TOKEN,
            role: ROLE
        }
    }).done(function (data, status, xhr) {
        
        if (xhr.status == OK) {

            let totalRecord = Number.parseInt(data)

            let pageLast = getPageLast(totalRecord)

            $('#totalRecord').val(data)
            $('#pageLast').val(pageLast)
        }
    }).fail(function () {
        console.log("failed")
    });
}

function getPageLast(totalRecord) {

    let pageLast = 1

    if (totalRecord !== 0 ) {
        pageLast = totalRecord % MAX_RESULT == 0 ?
                    totalRecord / MAX_RESULT : Math.floor(totalRecord / MAX_RESULT) + 1
    } else {
        pageLast = 1;
    }

    return pageLast;
}

function disableButtonPagination() {

    let page = Number.parseInt($('#page').val() == '' ? 1 : $('#page').val())

    let pageLast = Number.parseInt($('#pageLast').val())
    
    if (PAGE_FIRST === pageLast) {
        $('#btnFirst').prop('disabled', true)
        $('#btnPrevious').prop('disabled', true)

        $('#btnNext').prop('disabled', true)
        $('#btnLast').prop('disabled', true)
    } else if (page === PAGE_FIRST) {
        $('#btnFirst').prop('disabled', true)
        $('#btnPrevious').prop('disabled', true)

        $('#btnNext').prop('disabled', false)
        $('#btnLast').prop('disabled', false)
    } else if(page === pageLast) {
        $('#btnFirst').prop('disabled', false)
        $('#btnPrevious').prop('disabled', false)

        $('#btnNext').prop('disabled', true)
        $('#btnLast').prop('disabled', true)
    } else {
        $('#btnFirst').prop('disabled', false)
        $('#btnPrevious').prop('disabled', false)

        $('#btnNext').prop('disabled', false)
        $('#btnLast').prop('disabled', false)
    }
}

// get cac list danh muc cho select
function findAllObjectsByStatus(url, callback) {
    
    $.ajax({
        url: `${url}/find.not.deleted`,
        type: 'GET',
        dataType: 'json',
        data: {
            token: TOKEN,
            role: ROLE
        }
    }).done(function (data, status, xhr) {

        if (xhr.status == OK) {
            callback(data)
        }
    }).fail(function () {
        console.log("failed")
    });
}

// render data to select of sub department
function renderDepartmentListToSelect(data) {

    let sel = `<option value='' selected>Chọn khoa</option>`
    
    $.each(data, function(key, value) {
        sel += `<option value='${value.departmentId}'>${value.departmentName}</option>`
    })

    $('#selDepartment').empty().append(sel)
}

// render data to select of sub department
function renderSubDepartmentListToSelect(data) {

    let sel = `<option value='' selected>Chọn bộ môn</option>`
    
    $.each(data, function(key, value) {
        sel += `<option value='${value.subDepartmentId}'>${value.subDepartmentName}</option>`
    })

    $('#selSubDepartment').empty().append(sel)
}

// render data to select of office
function renderOfficeListToSelect(data) {

    let sel = `<option value='' selected>Chọn chức vụ</option>`
    
    $.each(data, function(key, value) {
        sel += `<option value='${value.officeId}'>${value.officeName}</option>`
    })

    $('#selOffice').empty().append(sel)
}

// render data to select of role
function renderRoleListToSelect(data) {

    let sel = `<option value='' selected>Chọn phân quyền</option>`
    
    $.each(data, function(key, value) {
        sel += `<option value='${value.roleId}'>${value.roleName}</option>`
    })

    $('#selRole').empty().append(sel)
}

// render data to select of role
function renderSubjectListToSelect(data) {

    let sel = `<option value='' selected>Chọn học phần</option>`
    
    $.each(data, function(key, value) {
        sel += `<option value='${value.subjectId}'>${value.subjectName}</option>`
    })

    $('#selSubject').empty().append(sel)
}

function renderLevelListToSelect(levelList) {

    let sel = `<option value='' selected>Chọn mức độ</option>`
    
    $.each(levelList, function(index, level) {
        sel += `<option value='${level.levelId}'>${level.levelName}</option>`
    })

    $('#selLevel').empty().append(sel)
}

function renderQuestionTypeListToSelect(questionTypeList) {

    let sel = `<option value='' selected>Chọn loại câu hỏi</option>`
    
    $.each(questionTypeList, function(index, questionType) {
        sel += `<option value='${questionType.questionTypeId}'>${questionType.questionTypeName}</option>`
    })

    $('#selQuestionType').empty().append(sel)
}

function findQuestionTypeByStatus(token) {

    return $.ajax({
        url: `${URL_QUESTION_TYPE_API}/find.not.deleted`,
        type: 'GET',
        dataType: 'json',
        data: {
            token: token
        }
    })
}

function findTopicBySubjectId(token, subjectId) {
    
    return $.ajax({
        url: `${URL_TOPIC_API}/find.subjectId`,
        type: 'GET',
        dataType: 'json',
        data: {
            token: token,
            subjectId: subjectId
        }
    })
}

function findSubjectByLecturerId(token, lecturerId) {
    
    return $.ajax({
        url: `${URL_SUBJECT_API}/find.lecturerId`,
        type: 'GET',
        dataType: 'json',
        data: {
            token: token,
            lecturerId: lecturerId
        }
    })
}

// xử lý nút check all
function handleCheckAll() {
    
    let count = 0
    let totalRecord = 0

    $.each($("input[name='delete']:checked"), function() {            
        
        count++
    })

    $.each($("input[name='delete']"), function() {            
        
        totalRecord++
    })

    if (count === totalRecord) {

        $('input[name="ckbAll"]').prop('checked', true)
    } else {
        $('input[name="ckbAll"]').prop('checked', false)
    }
}

function scrollToTop(elementPointBreak, elementBackToTop) {

    var elementHeight = elementPointBreak.outerHeight(); // Get the height of the point break element
    var elementOffset = elementPointBreak.offset().top; // Get the top offset of the point break element

    $(window).scroll(function () {

        var scrollPosition = $(this).scrollTop(); // Get the current scroll position

        // Check if the user has scrolled past the point break element
        if (scrollPosition >= elementHeight + elementOffset) {
            elementBackToTop.fadeIn(); // Show the "back to top" button
        } else {
            elementBackToTop.fadeOut(); // Hide the "back to top" button
        }
    });

    elementBackToTop.click(function () {
        $("html, body").animate({ scrollTop: 0 }, "smooth"); // Scroll to the top of the page
    });
}

function findSubjectListBySubDepartmentId(subDepartmentId, token) {

    return $.ajax({
        url: `${URL_SUBJECT_API}/find.subdepartmentid`,
        type: 'GET',
        dataType: 'json',
        data: {
            subDepartmentId: subDepartmentId,
            token: token
        }
    })
}