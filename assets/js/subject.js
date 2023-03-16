function initSubject() {
    $(document).ready(function() {
        $('#page').val(1)
        sessionStorage.setItem("searchSubject", STRING_EMPTY)

        getTotalRecord(URL_SUBJECT_API, "searchSubject")
        findAllObjectsPagination(URL_SUBJECT_API, PAGE_FIRST, STRING_EMPTY, renderSubjectList)
        findAllObjectsByStatus(URL_SUB_DEPARTMENT_API, renderSubDepartmentListToSelect)
    })
}

$(document).on('click', '#btnResetSubject', function() {
    resetSubjectForm()
})

// Enable/disable the save button
$(document).on("change paste keyup", '#txtID', function() {

    if (this.value != '') {
        $('#btnSaveSubject').prop('disabled', false)
    } else {
        $('#btnSaveSubject').prop('disabled', true)
    }
});

// import 
$(document).on('click', '#btnImportSubject', function (e) {

    let formData = new FormData();

    let file = $('#file').prop('files')[0]
    formData.append('file', file)
    formData.append('token', TOKEN)

    importSubject(formData)
    //getTotalRecord(URL_SUBJECT_API, "searchSubject")
})

// xu ly su kien cho nut Delete
$(document).on('click', '#btnDeleteSubject', function() {

    var array = [];
    $.each($("input[name='delete']:checked"), function(){            
        array.push($(this).val());
    });

    let formData = new FormData();

    formData.append('subjectIdArray', array)
    formData.append('token', TOKEN)

    if(array != []) {
        removeSubject(formData)
    }
})

// xu ly su kien cho nut Save
$(document).on('click', '#btnSaveSubject', function() {

    validateSubjectForm()

    if ($("#frmSubject").valid() == false) {
        
        return;
    }

    let action = $('#action').val()

    let formData = getDataFromForm()

    if (action == '') {

        addSubject(formData)
    } else {

        updateSubject(formData)
    }
})

// xu ly su kien cho nut Edit
$(document).on('click', '#tbodySubject td', function() {

    let subjectId = $(this).closest('tr').attr('id')

    findSubjectById(subjectId, TOKEN)

    $('#action').val(1)

    $('#txtID').prop('disabled', true);

    $('#btnSaveSubject').prop('disabled', false)
})

// xử lý sự kiện cho switch button
$(document).on('click', '#tbodySubject input[name=switch]', function(e) {

    e.stopPropagation()

    let subjectId = $(this).closest('tr').attr('id')
    
    changeSubjectStatus(subjectId, TOKEN)
})

// xu ly su kien search
$(document).on('keyup', '#txtSearchSubject', function (e) {

    if (e.keyCode === 13) {
        let searchString = $.trim($('#txtSearchSubject').val())

        $('#page').val(1)

        sessionStorage.setItem("searchSubject", searchString)

        getTotalRecord(URL_SUBJECT_API, "searchSubject")
        findAllObjectsPagination(URL_SUBJECT_API, PAGE_FIRST, searchString, renderSubjectList)
    }

})

// xử lý phân trang
// button next
$(document).on('click', '#subjectPagination #btnNext', function() {

    let page = $('#page').val()

    let searchString = $.trim(sessionStorage.getItem("searchSubject"))

    let pageNext = 1 + Number.parseInt(page)
    $('#page').val(pageNext)

    findAllObjectsPagination(URL_SUBJECT_API, pageNext, searchString, renderSubjectList)
})

// button previous
$(document).on('click', '#subjectPagination #btnPrevious', function() {

    let page = $('#page').val()
    let searchString = $.trim(sessionStorage.getItem("searchSubject"))

    let pagePrevious = Number.parseInt(page) - 1
    $('#page').val(pagePrevious)

    findAllObjectsPagination(URL_SUBJECT_API, pagePrevious, searchString, renderSubjectList)
})

// button first
$(document).on('click', '#subjectPagination #btnFirst', function() {

    let pageFirst = PAGE_FIRST
    let searchString = $.trim(sessionStorage.getItem("searchSubject"))

    $('#page').val(pageFirst)

    findAllObjectsPagination(URL_SUBJECT_API, pageFirst, searchString, renderSubjectList)
})

// button last
$(document).on('click', '#subjectPagination #btnLast', function() {

    let pageLast = Number.parseInt($('#pageLast').val())
    let searchString = $.trim(sessionStorage.getItem("searchSubject"))

    $('#page').val(pageLast)

    findAllObjectsPagination(URL_SUBJECT_API, pageLast, searchString, renderSubjectList)
})

$(document).on('change', 'input[name="delete"]', function() {

    handleCheckAll()
})

// ham import giang vien bang file excel
function importSubject(formData) {

    $('.loader_bg').show()

    $.ajax({
        url: `${URL_SUBJECT_API}/upload`,
        type: 'POST',
        cache: false,
        contentType: false,
        processData: false,
        enctype: "multipart/form-data",
        data: formData
    }).done(function (data, status, xhr) {

        if (xhr.status == OK) {

            let searchString = $.trim(sessionStorage.getItem("searchSubject"))
            getTotalRecord(URL_SUBJECT_API, "searchSubject")
            findAllObjectsPagination(URL_SUBJECT_API, $('#page').val(), searchString, renderSubjectList)

            $('.loader_bg').hide()
        }
    }).fail(function () {
        console.log("failed")

        $('.loader_bg').hide()
    });
}

// ham thay doi trang thai cua doi tuong
function changeSubjectStatus(subjectId, token) {

    $.ajax({
        url: `${URL_SUBJECT_API}/changeStatus`,
        type: 'POST',
        dataType: 'text',
        data: {
            subjectId: subjectId,
            token: token
        }
    }).done(function (data, status, xhr) {
        
        if (xhr.status == OK) {

            let searchString = $.trim(sessionStorage.getItem("searchSubject"))
            let page = $('#page').val()
            findAllObjectsPagination(URL_SUBJECT_API, page, searchString, renderSubjectList)
        }
    }).fail(function () {
        console.log("failed")
    });
}

// ham xoa chức vụ
function removeSubject(formData) {

    $.ajax({
        url: `${URL_SUBJECT_API}/remove`,
        type: 'POST',
        dataType: 'text',
        cache: false,
        contentType: false,
        processData: false,
        data: formData
    }).done(function (data, status, xhr) {
        
        if (xhr.status == OK) {

            let searchString = $.trim(sessionStorage.getItem("searchSubject"))
            let page = $('#page').val()
            findAllObjectsPagination(URL_SUBJECT_API, page, searchString, renderSubjectList)
        }
    }).fail(function () {
        console.log("failed")
    });
}

// ham lay chức vụ theo id
function findSubjectById(id, token) {
    $.ajax({
        url: `${URL_SUBJECT_API}/find.id`,
        type: 'GET',
        dataType: 'json',
        data: {
            subjectId: id,
            token: token
        }
    }).done(function (data, status, xhr) {

        if (xhr.status == OK) {

            $('#txtID').val(data.subjectId)
            $('#txtName').val(data.subjectName)
            $('#txtCreditQuanity').val(data.creditQuantity)
            $('#selSubDepartment').val(data.subDepartment.subDepartmentId)
        }
    }).fail(function () {
        console.log("failed")
    });
}

// ham cap nhat chức vụ 
function updateSubject(formData) {
    $.ajax({
        url: `${URL_SUBJECT_API}/update`,
        type: 'POST',
        dataType: 'text',
        cache: false,
        contentType: false,
        processData: false,
        data: formData
    }).done(function (data, status, xhr) {
        
        if (xhr.status == OK) {

            let searchString = $.trim(sessionStorage.getItem("searchSubject"))
            let page = $('#page').val()
            findAllObjectsPagination(URL_SUBJECT_API, page, searchString, renderSubjectList)

            resetSubjectForm()
        }
    }).fail(function () {
        console.log("failed")
    });
}

// ham them chức vụ 
function addSubject(formData) {
    $.ajax({
        url: `${URL_SUBJECT_API}/add`,
        type: 'POST',
        dataType: 'text',
        cache: false,
        contentType: false,
        processData: false,
        data: formData
    }).done(function (data, status, xhr) {
        if (xhr.status == CREATED) {

            let searchString = $.trim(sessionStorage.getItem("searchSubject"))
            let page = $('#page').val()
            getTotalRecord(URL_SUBJECT_API, "searchSubject")
            findAllObjectsPagination(URL_SUBJECT_API, page, searchString, renderSubjectList)

            resetSubjectForm()
        }
    }).fail(function (data) {
        if (data.status == CONFLICT) {
            console.log("Conflict")
        }
        console.log("failed")
    });
}

// ham render danh sach chức vụ ra man hinh
function renderSubjectList(data) {
    let tbody = ''

    $.each(data, function(key, value) {
        tbody += `<tr id="${value.subjectId}">
                    <td class="text-center"><input type="checkbox" name="delete" value="${value.subjectId}"></td>
                    <td>${value.subjectId}</td>
                    <td>${value.subjectName}</td>
                    <td>${value.creditQuantity}</td>
                    <td>${value.subDepartment.subDepartmentName}</td>
                    <td align="center"><div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" role="switch" name="switch" ${value.deleted == 0 ? 'checked' : ''}>
                    </div></td>
                </tr>`
    })
    $('#tbodySubject').empty().append(tbody)

    if ($('input[name="ckbAll"]').is(':checked')) {

        $('input[name="ckbAll"]').prop('checked', false)
    }

    scrollToTop($("#frmSubject"), $("#backToTopSubject"))
}

// thuc hien tien xu ly va hau xu ly sau khi update or add
function resetSubjectForm() {

    $("#frmSubject").trigger("reset");

    $('#txtID').prop('disabled', false);
    $("#btnSaveSubject").prop("disabled", true);

    // set lai action sau khi update xong
    $('#action').val('')
}

function getDataFromForm() {
    
    let subjectId = $.trim($('#txtID').val())
    let subjectName = $.trim($('#txtName').val())
    let creditQuantity = $.trim($('#txtCreditQuanity').val())
    let subDepartmentId = $.trim($('#selSubDepartment').val())

    let formData = new FormData();

    formData.append('subjectId', subjectId)
    formData.append('subjectName', subjectName)
    formData.append('creditQuantity', creditQuantity)
    formData.append('subDepartmentId', subDepartmentId)
    formData.append('token', TOKEN)

    return formData;
}

function validateSubjectForm() {

    $("#frmSubject").validate({
        rules: {
            subjectId: {
                required: true,
                minlength: 3
            },
            subjectName: {
                required: true
            },
            credit: {
                required: true,
                number: true,
                min: 1
            },
            selSubDepartment: {
                required: true
            }
        },
        messages: {
            subjectId: {
                required: "Nhập mã học phần",
                minlength: "Mã học phần phải có ít nhất 3 ký tự"
            },
            subjectName: {
                required: "Nhập tên học phần"
            },
            credit: {
                required: "Nhập số tín chỉ",
                number: "Số tín chỉ phải là số",
                min: "Số tín chỉ phải lớn hơn hoặc bằng 1"
            },
            selSubDepartment: {
                required: "Chọn tổ bộ môn",
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
