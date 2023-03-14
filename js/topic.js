function initTopic() {
    $(document).ready(function() {

        if (ROLE == "Admin") {
            findAllObjects(URL_SUBJECT_API, renderSubjectListToSelect)
            findAllObjects(URL_TOPIC_API, renderTopicList)
        } else {
            let user = JSON.parse(sessionStorage.getItem("user"))

            findSubjectListBySubDepartmentId(user.subDepartmentId, TOKEN)
            .done(function (data, status, xhr) {
        
                if (xhr.status == OK) {
        
                    renderSubjectListToSelect(data)
                }
            }).fail(function () {
                console.log("failed")
            });

            findTopicListBySubDepartmentId(user.subDepartmentId, TOKEN)
        }
    })
}

$(document).on('click', '#btnResetTopic', function() {
    resetTopicForm()
})

// Enable/disable the save button
$(document).on("change paste keyup", '#txtID', function() {

    if (this.value != '') {
        $('#btnSaveTopic').prop('disabled', false)
    } else {
        $('#btnSaveTopic').prop('disabled', true)
    }
 });

// xu ly su kien cho nut Delete
$(document).on('click', '#btnDeleteTopic', function() {

    var array = [];
    $.each($("input[name='delete']:checked"), function(){            
        array.push($(this).val());
    });

    let formData = new FormData();

    formData.append('topicIdArray', array)
    formData.append('token', TOKEN)

    if(array != []) {
        removeTopic(formData)
    }
})

$(document).on('change', 'input[name="delete"]', function() {

    handleCheckAll()
})

function findSubjectByLecturerId(token, lecturerId) {
    
    $.ajax({
        url: `${URL_SUBJECT_API}/find.lecturerId`,
        type: 'GET',
        dataType: 'json',
        data: {
            token: token,
            lecturerId: lecturerId
        }
    }).done(function (data, status, xhr) {
        
        if (xhr.status == OK) {

            renderSubjectListToSelect(data)
        }
    }).fail(function () {
        console.log("failed")
    });
}

// xu ly su kien cho nut Save
$(document).on('click', '#btnSaveTopic', function() {

    validateTopicForm()

    if ($("#frmTopic").valid() == false) {
        
        return;
    }
    
    let action = $('#action').val()

    let formData = getTopicForm()

    if (action == '') {

        addTopic(formData)
    } else {

        updateTopic(formData)
    }
})

// xu ly su kien cho nut Edit
$(document).on('click', '#tbodyTopic td', function() {

    let topicId = $(this).closest('tr').attr('id')

    findTopicById(topicId, TOKEN)

    $('#action').val(1)

    $('#txtID').prop('disabled', true);

    $('#btnSaveTopic').prop('disabled', false)
})

// xử lý sự kiện cho switch button
$(document).on('click', '#tbodyTopic input[name=switch]', function(e) {

    e.stopPropagation()

    let topicId = $(this).closest('tr').attr('id')
    
    changeTopicStatus(topicId, TOKEN)
})

// ham thay doi trang thai cua doi tuong
function changeTopicStatus(topicId, token) {

    $.ajax({
        url: `${URL_TOPIC_API}/changeStatus`,
        type: 'POST',
        dataType: 'text',
        data: {
            topicId: topicId,
            token: token
        }
    }).done(function (data, status, xhr) {
        
        if (xhr.status == OK) {

            findAllObjects(URL_TOPIC_API, renderTopicList)
        }
    }).fail(function () {
        console.log("failed")
    });
}

// ham xoa chức vụ theo id
function removeTopic(formData) {

    $.ajax({
        url: `${URL_TOPIC_API}/remove`,
        type: 'POST',
        dataType: 'text',
        cache: false,
        contentType: false,
        processData: false,
        data: formData
    }).done(function (data, status, xhr) {
        
        if (xhr.status == OK) {

            findAllObjects(URL_TOPIC_API, renderSubjectList)
        }
    }).fail(function () {
        console.log("failed")
    });
}

// ham lay chức vụ theo id
function findTopicById(id, token) {
    $.ajax({
        url: `${URL_TOPIC_API}/find.id`,
        type: 'GET',
        dataType: 'json',
        data: {
            topicId: id,
            token: token
        }
    }).done(function (data, status, xhr) {

        if (xhr.status == OK) {
            
            $('#txtID').val(data.topicId)
            $('#txtName').val(data.topicName)
            $('#selSubject').val(data.subject.subjectId)
        }
    }).fail(function () {
        console.log("failed")
    });
}

// ham lay chức vụ theo id
function findTopicListBySubDepartmentId(id, token) {
    $.ajax({
        url: `${URL_TOPIC_API}/find.subdepartmentid`,
        type: 'GET',
        dataType: 'json',
        data: {
            subDepartmentId: id,
            token: token
        }
    }).done(function (data, status, xhr) {

        if (xhr.status == OK) {
            
            renderTopicList(data)
        }
    }).fail(function () {
        console.log("failed")
    });
}

// ham cap nhat chức vụ 
function updateTopic(formData) {
    $.ajax({
        url: `${URL_TOPIC_API}/update`,
        type: 'POST',
        dataType: 'text',
        cache: false,
        contentType: false,
        processData: false,
        data: formData
    }).done(function (data, status, xhr) {
        
        if (xhr.status == OK) {
            findAllObjects(URL_TOPIC_API, renderTopicList)

            resetTopicForm()
        }
    }).fail(function () {
        console.log("failed")
    });
}

// ham them chức vụ 
function addTopic(formData) {
    $.ajax({
        url: `${URL_TOPIC_API}/add`,
        type: 'POST',
        dataType: 'text',
        cache: false,
        contentType: false,
        processData: false,
        data: formData
    }).done(function (data, status, xhr) {
        if (xhr.status == CREATED) {

            findAllObjects(URL_TOPIC_API, renderTopicList)

            resetTopicForm()
        }
    }).fail(function (data) {
        if (data.status == CONFLICT) {
            console.log("Conflict")
        }
        console.log("failed")
    });
}

// ham render danh sach chức vụ ra man hinh
function renderTopicList(data) {

    let tbody = ''

    $.each(data, function(key, value) {
        tbody += `<tr id="${value.topicId}">
                    <td class="text-center"><input type="checkbox" name="delete" value="${value.topicId}"></td>
                    <td>${value.topicId}</td>
                    <td>${value.topicName}</td>
                    <td>${value.subject.subjectName}</td>
                    <td align="center"><div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" role="switch" name="switch" ${value.deleted == 0 ? 'checked' : ''}>
                    </div></td>
                </tr>`
    })

    $('#tbodyTopic').empty().append(tbody)

    if ($('input[name="ckbAll"]').is(':checked')) {

        $('input[name="ckbAll"]').prop('checked', false)
    }
}

// thuc hien tien xu ly va hau xu ly sau khi update or add
function resetTopicForm() {
    
    $("#frmTopic").trigger("reset");

    $('#txtID').prop('disabled', false);
    $("#btnSaveTopic").prop("disabled", true);

    // set lai action sau khi update xong
    $('#action').val('')

    $('input').closest(".form-group").removeClass("has-error");
}

function getTopicForm() {
    let topicId = $.trim($('#txtID').val())
    let topicName = $.trim($('#txtName').val())
    let subjectId = $.trim($('#selSubject').val())

    let formData = new FormData();

    formData.append('topicId', topicId)
    formData.append('topicName', topicName)
    formData.append('subjectId', subjectId)
    formData.append('token', TOKEN)
    
    return formData;
}

function validateTopicForm() {

    $("#frmTopic").validate({
        rules: {
            topicId: {
                required: true,
                minlength: 3,
                maxlength: 10
            },
            topicName: {
                required: true,
                minlength: 3,
                maxlength: 50
            },
            selSubject: {
                required: true
            }
        },
        messages: {
            topicId: {
                required: "Nhập mã chủ đề",
                minlength: "Mã chủ đề ít nhất phải có 3 ký tự",
                maxlength: "Mã chủ đề tối đa chỉ có 10 ký tự"
            },
            topicName: {
                required: "Nhập tên chủ đề",
                minlength: "Tên chủ đề ít nhất phải có 3 ký tự",
                maxlength: "Tên chủ đề tối đa chỉ có 50 ký tự"
            },
            selSubject: {
                required: "Chọn học phần"
            }
        },
        highlight: function (element) {
            $(element).closest(".form-group").addClass("has-error");
        },
        unhighlight: function (element) {
            $(element).closest(".form-group").removeClass("has-error");
        }
    });
}