function initDepartment() {
    $(document).ready(function() {
        findAllObjects(URL_DEPARTMENT_API, renderDepartmentList)
    })
}

$(document).ready(function() {
    $('#btnSaveDepartment').prop('disabled', true)
})

$(document).on('click', '#btnResetDepartment', function() {
    resetDepartmentForm()
})

// Enable/disable the save button
$(document).on("change paste keyup", '#txtID', function () {

    if (this.value != '') {
        $('#btnSaveDepartment').prop('disabled', false)
    } else {
        $('#btnSaveDepartment').prop('disabled', true)
    }
});

// xu ly su kien cho nut Delete
$(document).on('click', '#btnDeleteDepartment', function() {

    var array = [];
    $.each($("input[name='delete']:checked"), function(){            
        array.push($(this).val());
    });

    let formData = new FormData();
    formData.append('departmentIdArray', array)
    formData.append('token', TOKEN)

    if(array != []) {
        removeDepartment(formData)
    }
})

// xu ly su kien cho nut Save
$(document).on('click', '#btnSaveDepartment', function(e) {

    validateDepartmentForm()

    if ($("#frmDepartment").valid() == false) {
        
        return;
    }

    let action = $('#action').val()

    let formData = getDepartmentForm()

    if (action == '') {

        addDepartment(formData)
    } else {

        updateDepartment(formData)
    }
})

// xu ly su kien cho nut Edit
$(document).on('click', '#tbodyDepartment td', function() {

    let departmentId = $(this).closest('tr').attr('id')

    findDepartmentById(departmentId, TOKEN)

    $('#action').val(1)

    $('#txtID').prop('disabled', true);

    $('#btnSaveDepartment').prop('disabled', false)
})

// xử lý sự kiện cho switch button
$(document).on('click', '#tbodyDepartment input[name=switch]', function(e) {

    e.stopPropagation()

    let departmentId = $(this).closest('tr').attr('id')

    changeDepartmentStatus(departmentId, TOKEN)
})

$(document).on('change', 'input[name="delete"]', function() {

    handleCheckAll()
})

// ham thay doi trang thai cua doi tuong
function changeDepartmentStatus(departmentId, token) {
    
    $.ajax({
        url: `${URL_DEPARTMENT_API}/changeStatus`,
        type: 'POST',
        dataType: 'text',
        data: {
            departmentId: departmentId,
            token: token
        }
    }).done(function (data, status, xhr) {
        
        if (xhr.status == OK) {

            findAllObjects(URL_DEPARTMENT_API, renderDepartmentList)
        }
    }).fail(function () {
        console.log("failed")
    });
}

// ham xoa khoa
function removeDepartment(formData) {
    
    $.ajax({
        url: `${URL_DEPARTMENT_API}/remove`,
        type: 'POST',
        dataType: 'text',
        cache: false,
        contentType: false,
        processData: false,
        data: formData
    }).done(function (data, status, xhr) {
        
        if (xhr.status == OK) {

            findAllObjects(URL_DEPARTMENT_API, renderDepartmentList)
        }
    }).fail(function () {
        console.log("failed")
    });
}

// ham lay khoa theo id
function findDepartmentById(id, token) {
    
    $.ajax({
        url: `${URL_DEPARTMENT_API}/find.id`,
        type: 'GET',
        dataType: 'json',
        data: {
            departmentId: id,
            token: token
        }
    }).done(function (data, status, xhr) {

        if (xhr.status == OK) {
            
            $('#txtID').val(data.departmentId)
            $('#txtName').val(data.departmentName)
        }
    }).fail(function () {
        console.log("failed")
    });
}

// ham cap nhat khoa 
function updateDepartment(formData) {

    $.ajax({
        url: `${URL_DEPARTMENT_API}/update`,
        type: 'POST',
        dataType: 'text',
        cache: false,
        contentType: false,
        processData: false,
        data: formData
    }).done(function (data, status, xhr) {
        
        if (xhr.status == OK) {

            findAllObjects(URL_DEPARTMENT_API, renderDepartmentList)

            resetDepartmentForm()
        }
    }).fail(function () {
        console.log("failed")
    });
}

// ham them khoa 
function addDepartment(formData) {
    $.ajax({
        url: `${URL_DEPARTMENT_API}/add`,
        type: 'POST',
        dataType: 'text',
        cache: false,
        contentType: false,
        processData: false,
        data: formData
    }).done(function (data, status, xhr) {
        if (xhr.status == CREATED) {
            findAllObjects(URL_DEPARTMENT_API, renderDepartmentList)

            resetDepartmentForm()
        }
    }).fail(function (data) {
        if (data.status == CONFLICT) {
            console.log("Conflict")
        }
        console.log("failed")
    });
}

// ham render danh sach khoa ra man hinh
function renderDepartmentList(data) {

    let tbody = ''

    $.each(data, function(key, value) {
        tbody += `<tr id="${value.departmentId}">
                    <td class="text-center"><input type="checkbox" name="delete" value="${value.departmentId}"></td>
                    <td>${value.departmentId}</td>
                    <td>${value.departmentName}</td>
                    <td align="center"><div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" role="switch" name="switch" ${value.deleted == 0 ? 'checked' : ''}>
                    </div></td>
                </tr>`
    })
    $('#tbodyDepartment').empty().append(tbody)

    if ($('input[name="ckbAll"]').is(':checked')) {

        $('input[name="ckbAll"]').prop('checked', false)
    }
}

// thuc hien tien xu ly va hau xu ly sau khi update or add
function resetDepartmentForm() {

    $("#frmDepartment").trigger("reset");

    $('#txtID').prop('disabled', false);
    $("#btnSaveDepartment").prop("disabled", true);

    // set lai action sau khi update xong
    $('#action').val('')
}

function getDepartmentForm() {

    let formData = new FormData()

    let departmentId = $.trim($('#txtID').val())
    let departmentName = $.trim($('#txtName').val())

    formData.append('departmentId', departmentId)
    formData.append('departmentName', departmentName)
    formData.append('token', TOKEN)

    return formData
}

function validateDepartmentForm(e) {
    
    $("#frmDepartment").validate({
        rules: {
            departmentId: {
                required: true,
                minlength: 3
            },
            departmentName: {
                required: true
            }
        },
        messages: {
            departmentId: {
                required: "Nhập mã khoa",
                minlength: "Mã khoa phải có ít nhất 3 kí tự"
            },
            departmentName: {
                required: "Nhập tên khoa"
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