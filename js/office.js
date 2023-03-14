function initOffice() {
    $(document).ready(function() {
        findAllObjects(URL_OFFICE_API, renderOfficeList)
    })
}

$(document).on('click', '#btnResetOffice', function() {
    resetOfficeForm()
})

// Enable/disable the save button
$(document).on("change paste keyup", '#txtID', function() {

    if (this.value != '') {
        $('#btnSaveOffice').prop('disabled', false)
    } else {
        $('#btnSaveOffice').prop('disabled', true)
    }
 });

// xu ly su kien cho nut Delete
$(document).on('click', '#btnDeleteOffice', function() {

    var array = [];
    $.each($("input[name='delete']:checked"), function(){            
        array.push($(this).val());
    });

    let formData = new FormData();

    formData.append('officeIdArray', array)
    formData.append('token', TOKEN)

    if(array != []) {
        removeOffice(formData)
    }
})

// xu ly su kien cho nut Save
$(document).on('click', '#btnSaveOffice', function() {

    validateOfficeForm()

    if ($("#frmOffice").valid() == false) {
        
        return;
    }

    let action = $('#action').val()
    
    let officeId = $.trim($('#txtID').val())
    let officeName = $.trim($('#txtName').val())

    if (action == '') {

        addOffice(officeId, officeName, TOKEN)
    } else {

        updateOffice(officeId, officeName, TOKEN)
    }
})

// xu ly su kien cho nut Edit
$(document).on('click', '#tbodyOffice td', function() {

    let officeId = $(this).closest('tr').attr('id')

    findOfficeById(officeId, TOKEN)

    $('#action').val(1)

    $('#txtID').prop('disabled', true);

    $('#btnSaveOffice').prop('disabled', false)
})

// xử lý sự kiện cho switch button
$(document).on('click', '#tbodyOffice input[name=switch]', function(e) {

    e.stopPropagation()

    let officeId = $(this).closest('tr').attr('id')
    
    changeOfficeStatus(officeId, TOKEN)
})

$(document).on('change', 'input[name="delete"]', function() {

    handleCheckAll()
})

// ham thay doi trang thai cua doi tuong
function changeOfficeStatus(officeId, token) {

    $.ajax({
        url: `${URL_OFFICE_API}/changeStatus`,
        type: 'POST',
        dataType: 'text',
        data: {
            officeId: officeId,
            token: token
        }
    }).done(function (data, status, xhr) {
        
        if (xhr.status == OK) {

            findAllObjects(URL_OFFICE_API, renderOfficeList)
        }
    }).fail(function () {
        console.log("failed")
    });
}

// ham xoa chức vụ
function removeOffice(formData) {

    $.ajax({
        url: `${URL_OFFICE_API}/remove`,
        type: 'POST',
        dataType: 'text',
        cache: false,
        contentType: false,
        processData: false,
        data: formData
    }).done(function (data, status, xhr) {
        
        if (xhr.status == OK) {

            findAllObjects(URL_OFFICE_API, renderOfficeList)
        }
    }).fail(function () {
        console.log("failed")
    });
}

// ham lay chức vụ theo id
function findOfficeById(id, token) {
    $.ajax({
        url: `${URL_OFFICE_API}/find.id`,
        type: 'GET',
        dataType: 'json',
        data: {
            officeId: id,
            token: token
        }
    }).done(function (data, status, xhr) {

        if (xhr.status == OK) {
            
            $('#txtID').val(data.officeId)
            $('#txtName').val(data.officeName)
        }
    }).fail(function () {
        console.log("failed")
    });
}

// ham cap nhat chức vụ 
function updateOffice(officeId, officeName, token) {
    $.ajax({
        url: `${URL_OFFICE_API}/update`,
        type: 'POST',
        dataType: 'text',
        data: {
            officeId: officeId,
            officeName: officeName,
            token: token
        }
    }).done(function (data, status, xhr) {
        
        if (xhr.status == OK) {
            findAllObjects(URL_OFFICE_API, renderOfficeList)

            resetOfficeForm()
        }
    }).fail(function () {
        console.log("failed")
    });
}

// ham them chức vụ 
function addOffice(officeId, officeName, token) {
    $.ajax({
        url: `${URL_OFFICE_API}/add`,
        type: 'POST',
        dataType: 'text',
        data: {
            officeId: officeId,
            officeName: officeName,
            token: token
        }
    }).done(function (data, status, xhr) {
        if (xhr.status == CREATED) {
            findAllObjects(URL_OFFICE_API, renderOfficeList)

            resetOfficeForm()
        }
    }).fail(function (data) {
        if (data.status == CONFLICT) {
            console.log("Conflict")
        }
        console.log("failed")
    });
}

// ham render danh sach chức vụ ra man hinh
function renderOfficeList(data, id) {
    let tbody = ''

    $.each(data, function(key, value) {
        tbody += `<tr id="${value.officeId}">
                    <td class="text-center"><input type="checkbox" name="delete" value="${value.officeId}"></td>
                    <td>${value.officeId}</td>
                    <td>${value.officeName}</td>
                    <td align="center"><div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" role="switch" name="switch" ${value.deleted == 0 ? 'checked' : ''}>
                    </div></td>
                </tr>`
    })
    $('#tbodyOffice').empty().append(tbody)

    if ($('input[name="ckbAll"]').is(':checked')) {

        $('input[name="ckbAll"]').prop('checked', false)
    }
}

// thuc hien tien xu ly va hau xu ly sau khi update or add
function resetOfficeForm() {

    $("#frmOffice").trigger("reset");

    $('#txtID').prop('disabled', false);
    $("#btnSaveOffice").prop("disabled", true);

    // set lai action sau khi update xong
    $('#action').val('')
}

function validateOfficeForm() {

    $("#frmOffice").validate({
        rules: {
            ID: {
                required: true,
                minlength: 2
            },
            name: {
                required: true,
            },
        },
        messages: {
            ID: {
                required: "Nhập mã chức vụ",
                minlength: "Mã chức vụ phải có ít nhất 2 ký tự"
            },
            name: {
                required: "Nhập tên chức vụ",
            },
        },
        highlight: function (element) {
            $(element).closest(".form-group").addClass("has-error");
        },
        unhighlight: function (element) {
            $(element).closest(".form-group").removeClass("has-error");
        }
    });

}