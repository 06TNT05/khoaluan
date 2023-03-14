function initSubDepartment() {
    $(document).ready(function() {
        findAllObjects(URL_SUB_DEPARTMENT_API, renderSubDepartmentList)
        findAllObjectsByStatus(URL_DEPARTMENT_API, renderDepartmentListToSelect)
    })
}

$(document).on('click', '#btnResetSubDepartment', function() {
    resetSubDepartmentForm()
})

// Enable/disable the save button
$(document).on("change paste keyup", '#txtID', function() {

    if (this.value != '') {
        $('#btnSaveSubDepartment').prop('disabled', false)
    } else {
        $('#btnSaveSubDepartment').prop('disabled', true)
    }
});

// xu ly su kien cho nut Delete
$(document).on('click', '#btnDeleteSubDepartment', function() {

    var array = [];
    $.each($("input[name='delete']:checked"), function(){            
        array.push($(this).val());
    });

    let formData = new FormData();

    formData.append('subDepartmentIdArray', array)
    formData.append('token', TOKEN)

    if(array != []) {
        removeSubDepartment(formData)
    }
})

// xu ly su kien cho nut Save
$(document).on('click', '#btnSaveSubDepartment', function() {

    validateSubDepartmentForm()

    if ($("#frmSubDepartment").valid() == false) {
        
        return;
    }

    let action = $('#action').val()
    
    let formData = getDepartmentForm()

    if (action == '') {

        addSubDepartment(formData)
    } else {

        updateSubDepartment(formData)
    }
})

// xu ly su kien cho nut Edit
$(document).on('click', '#tbodySubDepartment td', function() {

    let subDepartmentId = $(this).closest('tr').attr('id')

    findSubDepartmentById(subDepartmentId, TOKEN)

    $('#action').val(1)

    $('#txtID').prop('disabled', true);

    $('#btnSaveSubDepartment').prop('disabled', false)
})

// xử lý sự kiện cho switch button
$(document).on('click', '#tbodySubDepartment input[name=switch]', function(e) {

    e.stopPropagation()

    let subDepartmentId = $(this).closest('tr').attr('id')
    
    changeOfficeStatus(subDepartmentId, TOKEN)
})

$(document).on('change', 'input[name="delete"]', function() {

    handleCheckAll()
})

// ham thay doi trang thai cua doi tuong
function changeOfficeStatus(subDepartmentId, token) {

    $.ajax({
        url: `${URL_SUB_DEPARTMENT_API}/changeStatus`,
        type: 'POST',
        dataType: 'text',
        data: {
            subDepartmentId: subDepartmentId,
            token: token
        }
    }).done(function (data, status, xhr) {
        
        if (xhr.status == OK) {

            findAllObjects(URL_SUB_DEPARTMENT_API, renderSubDepartmentList)
        }
    }).fail(function () {
        console.log("failed")
    });
}

// ham xoa to bo mon
function removeSubDepartment(formData) {

    $.ajax({
        url: `${URL_SUB_DEPARTMENT_API}/remove`,
        type: 'POST',
        dataType: 'text',
        cache: false,
        contentType: false,
        processData: false,
        data: formData
    }).done(function (data, status, xhr) {
        
        if (xhr.status == OK) {

            findAllObjects(URL_SUB_DEPARTMENT_API, renderSubDepartmentList)
        }
    }).fail(function () {
        console.log("failed")
    });
}

// ham lay to bo mon theo id
function findSubDepartmentById(id, token) {
    $.ajax({
        url: `${URL_SUB_DEPARTMENT_API}/find.id`,
        type: 'GET',
        dataType: 'json',
        data: {
            subDepartmentId: id,
            token: token
        }
    }).done(function (data, status, xhr) {

        if (xhr.status == OK) {
            
            $('#txtID').val(data.subDepartmentId)
            $('#txtName').val(data.subDepartmentName)
            $('#selDepartment').val(data.departmentId)
        }
    }).fail(function () {
        console.log("failed")
    });
}

// ham cap nhat to bo mon
function updateSubDepartment(formData) {
    $.ajax({
        url: `${URL_SUB_DEPARTMENT_API}/update`,
        type: 'POST',
        dataType: 'text',
        cache: false,
        contentType: false,
        processData: false,
        data: formData
    }).done(function (data, status, xhr) {
        
        if (xhr.status == OK) {
            findAllObjects(URL_SUB_DEPARTMENT_API, renderSubDepartmentList)

            resetSubDepartmentForm()
        }
    }).fail(function () {
        console.log("failed")
    });
}

// ham them to bo mon 
function addSubDepartment(formData) {
    $.ajax({
        url: `${URL_SUB_DEPARTMENT_API}/add`,
        type: 'POST',
        dataType: 'text', // note
        cache: false,
        contentType: false,
        processData: false,
        data: formData
    }).done(function (data, status, xhr) {

        if (xhr.status == CREATED) {
            findAllObjects(URL_SUB_DEPARTMENT_API, renderSubDepartmentList)

            resetSubDepartmentForm()
        }
    }).fail(function (data) {
        if (data.status == CONFLICT) {
            console.log("Conflict")
        }
        console.log("failed")
    });
}

// ham render danh sach to bo mon ra man hinh
function renderSubDepartmentList(data) {
    let tbody = ''

    $.each(data, function(key, value) {
        tbody += `<tr id="${value.subDepartmentId}">
                    <td class="text-center"><input type="checkbox" name="delete" value="${value.subDepartmentId}"></td>
                    <td>${value.subDepartmentId}</td>
                    <td>${value.subDepartmentName}</td>
                    <td>${value.department.departmentName}</td>
                    <td align="center"><div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" role="switch" name="switch" ${value.deleted == 0 ? 'checked' : ''}>
                    </div></td>
                </tr>`
    })
    $('#tbodySubDepartment').empty().append(tbody)

    if ($('input[name="ckbAll"]').is(':checked')) {

        $('input[name="ckbAll"]').prop('checked', false)
    }
}

// thuc hien tien xu ly va hau xu ly sau khi update or add
function resetSubDepartmentForm() {

    $("#frmSubDepartment").trigger("reset");

    $('#txtID').prop('disabled', false);
    $("#btnSaveSubDepartment").prop("disabled", true);

    // set lai action sau khi update xong
    $('#action').val('')
}

function getDepartmentForm() {

    let formData = new FormData();

    let subDepartmentId = $.trim($('#txtID').val())
    let subDepartmentName = $.trim($('#txtName').val())
    let departmentId = $('#selDepartment').find(':selected').val()

    formData.append('subDepartmentId', subDepartmentId)
    formData.append('subDepartmentName', subDepartmentName)
    formData.append('departmentId', departmentId)
    formData.append('token', TOKEN)

    return formData
}

function validateSubDepartmentForm() {

    $("#frmSubDepartment").validate({
        rules: {
            departmentId: {
                required: true,
                minlength: 3
            },
            departmentName: {
                required: true,
            },
            selDepartment: {
                required: true
            }
        },
        messages: {
            departmentId: {
                required: "Nhập mã bộ môn.",
                minlength: "Mã bộ môn phải có ít nhất 3 ký tự."
            },
            departmentName: {
                required: "Nhập tên bộ môn."
            },
            selDepartment: {
                required: "Chọn khoa."
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