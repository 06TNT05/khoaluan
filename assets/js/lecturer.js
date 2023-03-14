// biến toàn cục lưu trữ các học phần được check
var subjectCheckedList = []

function initLecturer() {

    $(document).ready(function () {
        $('#page').val(1)
        sessionStorage.setItem("searchLecturer", STRING_EMPTY)

        getTotalRecord(URL_LECTURER_API, "searchLecturer")
        findAllObjectsPagination(URL_LECTURER_API, PAGE_FIRST, STRING_EMPTY, renderLecturerList)
        findAllObjectsByStatus(URL_SUB_DEPARTMENT_API, renderSubDepartmentListToSelect)
        findAllObjects(URL_ROLE_API, renderRoleListToSelect)
        findAllObjectsByStatus(URL_OFFICE_API, renderOfficeListToSelect)
    })
}

$(document).on('click', '#btnResetLecturer', function() {

    resetLecturerForm()
})

// handle select sub department change
$(document).on('change', '#selSubDepartment', function () {

    let action = $('#action').val()

    let subDepartmentId = $(this).val();
    let lecturerId = $('#txtID').val()

    // case: edit
    if (action != '') {

        renderSubjectListWithChecked(lecturerId, subDepartmentId, TOKEN, ROLE)
    } else {

    // case: add
        findSubjectListBySubDepartmentId(subDepartmentId, TOKEN)
        .done(function (data, status, xhr) {

            renderSubjectListCheckBox(data)

            checkedCheckbox($('input[name="ckbSubject"]'), subjectCheckedList)
        }).fail(function () {
            console.log("failed")
        });
    }
    
    $('#subject-container').removeClass('d-none')
    $('#subject-container').show()
});


// sự kiện change subject checkbox
$(document).on('change', 'input[name="ckbSubject"]', function () {

    let ckbValue = $(this).val()

    if ($(this).is(':checked')) {
        // nếu ckbValue ko có trong mảng subjectCheckedList, thì thêm vào nó
        if ($.inArray(ckbValue, subjectCheckedList) === -1) {

            subjectCheckedList.push(ckbValue)
        }
    } else {

        // nếu bỏ check checkbox thì loại nó ra khỏi subjectCheckedList
        subjectCheckedList = subjectCheckedList.filter(value => value !== ckbValue)
    }

    console.log(subjectCheckedList);
})

// Enable/disable the save button
$(document).on("change paste keyup", '#txtID', function () {

    if (this.value != '') {
        $('#btnSaveLecturer').prop('disabled', false)
    } else {
        $('#btnSaveLecturer').prop('disabled', true)
    }
});

// import 
$(document).on('click', '#btnImportLecturer', function () {
    
    let formData = new FormData();

    let file = $('#file').prop('files')[0]

    formData.append('file', file)
    formData.append('token', TOKEN)
    formData.append('role', ROLE)

    importLecturer(formData)
    //getTotalRecord(URL_LECTURER_API, "searchLecturer")
})

// xu ly su kien cho nut Delete
$(document).on('click', '#btnDeleteLecturer', function () {

    var array = [];
    $.each($("input[name='delete']:checked"), function () {
        array.push($(this).val());
    });

    let formData = new FormData();
    
    formData.append('lecturerIdArray', array)
    formData.append('token', TOKEN)
    formData.append('role', ROLE)

    if (array != []) {
        removeLecturer(formData)
    }
})

// xu ly su kien cho nut Save
$(document).on('click', '#btnSaveLecturer', function () {

    validateLecturerForm()

    if ($("#frmLecturer").valid() == false) {
        
        return;
    }

    // lay action se thuc thi
    let action = $('#action').val()

    let formData = getLecturerForm(action);

    if (action == '') {

        addLecturer(formData)
    } else {
        updateLecturer(formData)
    }

    subjectCheckedList = []
})

// xu ly su kien cho nut Edit
$(document).on('click', '#tbodyLecturer td', function () {

    // reset subjectCheckedList
    subjectCheckedList = []

    let lecturerId = $(this).closest('tr').attr('id')

    findLecturerById(lecturerId, ROLE, TOKEN, function (subDepartmentId) {

        renderSubjectListWithChecked(lecturerId, subDepartmentId, TOKEN, ROLE)
    })

    $('#action').val(1)

    $('#txtID').prop('disabled', true);

    $('#btnSaveLecturer').prop('disabled', false)
})

// xử lý sự kiện cho switch button
$(document).on('click', '#tbodyLecturer input[name=switch]', function(e) {

    e.stopPropagation()

    let lecturerId = $(this).closest('tr').attr('id')
    
    changeLecturerStatus(lecturerId, TOKEN)
})

// xu ly su kien search
$(document).on('keyup', '#txtSearchLecturer', function (e) {

    if (e.keyCode === 13) {
        
        let searchString = $.trim($('#txtSearchLecturer').val())

        $('#page').val(1)

        sessionStorage.setItem("searchLecturer", searchString)

        getTotalRecord(URL_LECTURER_API, "searchLecturer")

        findAllObjectsPagination(URL_LECTURER_API, PAGE_FIRST, searchString, renderLecturerList)
    }
})

// xử lý phân trang
// button next
$(document).on('click', '#lecturerPagination #btnNext', function() {

    let page = $('#page').val()

    let searchString = $.trim(sessionStorage.getItem("searchLecturer"))

    let pageNext = 1 + Number.parseInt(page)
    $('#page').val(pageNext)

    findAllObjectsPagination(URL_LECTURER_API, pageNext, searchString, renderLecturerList)
})

// button previous
$(document).on('click', '#lecturerPagination #btnPrevious', function() {

    let page = $('#page').val()
    let searchString = $.trim(sessionStorage.getItem("searchLecturer"))

    let pagePrevious = Number.parseInt(page) - 1
    $('#page').val(pagePrevious)

    findAllObjectsPagination(URL_LECTURER_API, pagePrevious, searchString, renderLecturerList)
})

// button first
$(document).on('click', '#lecturerPagination #btnFirst', function() {

    let pageFirst = PAGE_FIRST
    let searchString = $.trim(sessionStorage.getItem("searchLecturer"))

    $('#page').val(pageFirst)

    findAllObjectsPagination(URL_LECTURER_API, pageFirst, searchString, renderLecturerList)
})

// button last
$(document).on('click', '#lecturerPagination #btnLast', function() {

    let pageLast =  Number.parseInt($('#pageLast').val())
    let searchString = $.trim(sessionStorage.getItem("searchLecturer"))

    $('#page').val(pageLast)

    findAllObjectsPagination(URL_LECTURER_API, pageLast, searchString, renderLecturerList)
})

$(document).on('change', 'input[name="delete"]', function() {

    handleCheckAll()
})

// ham lay hoc phan giang day cua giang vien
function getTeachingList(lecturerId, role, token, callback) {

    $.ajax({
        url: `${URL_LECTURER_API}/getTeachingList`,
        type: 'GET',
        dataType: 'json',
        data: {
            lecturerId: lecturerId,
            role: role,
            token: token
        }
    }).done(function (data, status, xhr) {
        
        if (xhr.status == OK) {
            
            callback(data)
        }
    }).fail(function () {
        console.log("failed")
    });
}

// ham thay doi trang thai cua doi tuong
function changeLecturerStatus(lecturerId, token) {

    $.ajax({
        url: `${URL_LECTURER_API}/changeStatus`,
        type: 'POST',
        dataType: 'text',
        data: {
            lecturerId: lecturerId,
            token: token
        }
    }).done(function (data, status, xhr) {
        
        if (xhr.status == OK) {

            let searchString = $.trim(sessionStorage.getItem("searchLecturer"))
            findAllObjectsPagination(URL_LECTURER_API, $("#page").val(), searchString, renderLecturerList)
        }
    }).fail(function () {
        console.log("failed")
    });
}

// ham import giang vien bang file excel
function importLecturer(formData) {

    $.ajax({
        url: `${URL_LECTURER_API}/upload`,
        type: 'POST',
        cache: false,
        contentType: false,
        processData: false,
        enctype: "multipart/form-data",
        data: formData
    }).done(function (data, status, xhr) {

        if (xhr.status == OK) {

            let searchString = $.trim(sessionStorage.getItem("searchLecturer"))
            getTotalRecord(URL_LECTURER_API, "searchLecturer")
            findAllObjectsPagination(URL_LECTURER_API, $("#page").val(), searchString, renderLecturerList)

            resetLecturerForm()
        }
    }).fail(function () {
        console.log("failed")
    });
}

// ham xoa giảng viên theo id
function removeLecturer(formData) {

    $.ajax({
        url: `${URL_LECTURER_API}/remove`,
        type: 'POST',
        dataType: 'text',
        cache: false,
        contentType: false,
        processData: false,
        data: formData
    }).done(function (data, status, xhr) {
        if (xhr.status == OK) {

            let searchString = $.trim(sessionStorage.getItem("searchLecturer"))
            findAllObjectsPagination(URL_LECTURER_API, $("#page").val(), searchString, renderLecturerList)
        }
    }).fail(function () {
        console.log("failed")
    });
}

// ham lay giảng viên theo id
function findLecturerById(id, role, token, callback) {

    $.ajax({
        url: `${URL_LECTURER_API}/find.id`,
        type: 'GET',
        dataType: 'json',
        data: {
            lecturerId: id,
            role: role,
            token: token
        }
    }).done(function (data, status, xhr) {

        if (xhr.status == OK) {

            $('#txtID').val(data.lecturerId)
            $('#txtName').val(data.lecturerName)
            $('#txtEmail').val(data.email)
            $('#txtPhone').val(data.phoneNumber)
            $('#selRole').val(data.account.roleId)
            $('#selSubDepartment').val(data.subDepartmentId)
            $('#selOffice').val(data.officeId)

            callback(data.subDepartmentId)
        }
    }).fail(function () {
        console.log("failed")
    });
}

// ham cap nhat giảng viên 
function updateLecturer(formData) {

    $.ajax({
        url: `${URL_LECTURER_API}/update`,
        type: 'POST',
        dataType: 'text',
        cache: false,
        contentType: false,
        processData: false,
        data: formData
    }).done(function (data, status, xhr) {

        if (xhr.status == OK) {

            let searchString = $.trim(sessionStorage.getItem("searchLecturer"))
            findAllObjectsPagination(URL_LECTURER_API, $("#page").val(), searchString, renderLecturerList)

            resetLecturerForm()
        }
    }).fail(function () {
        console.log("failed")
    });
}

// ham them giảng viên 
function addLecturer(formData) {

    $.ajax({
        url: `${URL_LECTURER_API}/add`,
        type: 'POST',
        dataType: 'text',
        cache: false,
        contentType: false,
        processData: false,
        data: formData
    }).done(function (data, status, xhr) {

        if (xhr.status == CREATED) {

            let searchString = $.trim(sessionStorage.getItem("searchLecturer"))
            
            getTotalRecord(URL_LECTURER_API, "searchLecturer")
            findAllObjectsPagination(URL_LECTURER_API, $("#page").val(), searchString, renderLecturerList)

            resetLecturerForm()
        }
    }).fail(function (data) {
        if (data.status == CONFLICT) {
            console.log("Conflict")
        }
        console.log("failed")
    });
}

// ham render danh sach giảng viên ra man hinh
function renderLecturerList(data) {

    let tbody = ''

    $.each(data, function (key, value) {
        tbody += `<tr id="${value.lecturerId}">
                    <td class="text-center"><input type="checkbox" name="delete" value="${value.lecturerId}"></td>
                    <td>${value.lecturerId}</td>
                    <td>${value.lecturerName}</td>
                    <td>${value.phoneNumber}</td>
                    <td>${value.email}</td>
                    <td><img src="${BASE_URL}${value.imageSrc}" alt="${value.lecturerName}" style="display:block; width:114px; height:116px;"></td>
                    <td>${value.office.officeName}</td>
                    <td align="center"><div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" role="switch" name="switch" ${value.deleted == 0 ? 'checked' : ''}>
                    </div></td>
                </tr>`
    })

    $('#tbodyLecturer').empty().append(tbody)

    if ($('input[name="ckbAll"]').is(':checked')) {

        $('input[name="ckbAll"]').prop('checked', false)
    }

    scrollToTop($(".navbar"), $('#backToTopLecturer'))
}

function getLecturerForm(action) {

    let formData = new FormData();

    let lecturerId = $.trim($('#txtID').val())
    let lecturerName = $.trim($('#txtName').val())
    let phoneNumber = $.trim($('#txtPhone').val())
    let email = $.trim($('#txtEmail').val())
    let roleId = $.trim($('#selRole').val())
    let subDepartmentId = $.trim($('#selSubDepartment').val())
    let officeId = $.trim($('#selOffice').val())
    let file = $('#filePicture').prop('files')[0]
    let isExternalSubject = $('#ckbExternalSubject').is(':checked') ? 1 : 0

    let subjects = subjectCheckedList

    formData.append('file', file === undefined ? new File([""], "file") : file)
    
    formData.append('lecturerId', lecturerId)
    formData.append('lecturerName', lecturerName)
    formData.append('phoneNumber', phoneNumber)
    formData.append('email', email)
    formData.append('roleId', roleId)
    formData.append('subDepartmentId', subDepartmentId)
    formData.append('officeId', officeId)
    formData.append('subjects', subjects)
    formData.append("token", TOKEN)
    formData.append("role", ROLE)
    formData.append("isExternalSubject", isExternalSubject)

    return formData
}

// ham render danh sach hoc phan de them
// hoc phan giang day cho giang vien
function renderSubjectListCheckBox(subjectList) {
    
    let subjectContainer = `<span class="fw-bold">Chọn học phần giảng dạy</span>
                            <div class="row ms-1 mt-1">`
    let count = 0;
    $.each(subjectList, function (key, value) {
        subjectContainer += `<div class="form-check col">
                                <input class="form-check-input" type="checkbox" value="${value.subjectId}" name="ckbSubject">
                                <label class="form-check-label">${value.subjectName}</label>
                            </div>`
        if (++count % 4 == 0) subjectContainer += `</div><div class="row ms-1 mt-1">`
    })

    if (count % 4 != 0) {

        // số cột còn trống
        let spaceCol = (Math.floor(count / 4) + 1) * 4 - count

        for (let i = 0; i < spaceCol; i++) {
            subjectContainer += `<div class="form-check col"></div>`
        }
    }

    //subjectContainer += `<div class="row ms-1 mt-1">`

    $('#subject-container').empty().append(subjectContainer)
}

// hàm checked checkbox có id trong danh sách subjectIds
function checkedCheckbox(checkboxs, subjectIds) {
    $.each(checkboxs, function(index, subject) {
        if ($.inArray($(subject).val(), subjectIds) !== -1) {
            $('input[value="' + $(subject).val() + '"]').prop('checked', true);
        }
    });
}

// hiển thị subject list kèm với checked các subject mà giảng viên đang giảng dạy
function renderSubjectListWithChecked(lecturerId, subDepartmentId, token, role) {

    findSubjectListBySubDepartmentId(subDepartmentId, token)
    .done(function (data, status, xhr) {

        if (xhr.status == OK) {

            // hiển thị ra subject list 
            renderSubjectListCheckBox(data)

            // lấy các học phần đang giảng dạy của giảng viên 
            getTeachingList(lecturerId, role, token, function(teachingList) {

                if (teachingList) {

                    // get list subjectIds
                    let subjectIds = teachingList.map(function(teaching) {
                        return teaching.subjectId;
                    });

                    subjectCheckedList.push(...subjectIds)// spread operation

                    // Get unique subjectCheckedList
                    subjectCheckedList = subjectCheckedList.filter(function(subjectChecked, index, arr) {

                        return arr.indexOf(subjectChecked) === index;
                    });
            
                    checkedCheckbox($('input[name="ckbSubject"]'), subjectCheckedList)

                    // get list subDepartmentIds
                    let subDepartmentIds = teachingList.map(function(teaching) {

                        return teaching.subject.subDepartment.subDepartmentId;
                    });

                    // Get unique subDepartmentIds
                    subDepartmentIds = subDepartmentIds.filter(function(subDepartmentId, index, arr) {

                        return arr.indexOf(subDepartmentId) === index;
                    });
                    
                    // nếu nhiều hơn 1 tổ bộ môn thì là đang làm việc tại tổ bộ môn khác
                    if (subDepartmentIds.length > 1) {
                        $('#ckbExternalSubject').prop('checked', true)
                    } else {
                        $('#ckbExternalSubject').prop('checked', false)
                    }
                    
                } else {
                    $('input[name="ckbSubject"]').prop('checked', false);
                }
            });
        }
    }).fail(function () {
        console.log("failed")
    });

    $('#subject-container').removeClass('d-none')
    $('#subject-container').show()
}

function resetLecturerForm() {

    subjectCheckedList = []

    $("#frmLecturer").trigger("reset");
    $('#file').val()

    $('#txtID').prop('disabled', false);
    $("#btnSaveLecturer").prop("disabled", true);

    // set lai action sau khi update xong
    $('#action').val('')

    $('#ckbExternalSubject').prop('checked', false)

    $('#subject-container').addClass('d-none')
}

function validateLecturerForm() {

    $("#frmLecturer").validate({
        rules: {
            lecturerId: {
                required: true,
                minlength: 3
            },
            lecturerName: {
                required: true,
            },
            phoneNumber: {
                required: true,
                number: true,
                pattern: /^[0-9]{10,11}$/
            },
            email: {
                required: true,
                email: true,
            },
            selRole: {
                required: true,
            },
            selSubDepartment: {
                required: true,
            },
            selOffice: {
                required: true,
            }
        },
        messages: {
            lecturerId: {
                required: "Nhập mã giảng viên",
                minlength: "Mã giảng viên phải có ít nhất 6 ký tự"
            },
            lecturerName: {
                required: "Nhập tên giảng viên",
            },
            phoneNumber: {
                required: "Nhập số điện thoại",
                number: "Số điện thoại không chứa kí tự",
                pattern: "Số điện thoại phải chứa 10 hoặc 11 chữ số"
            },
            email: {
                required: "Nhập email",
                email: "Email không đúng định dạng",
            },
            selRole: {
                required: "Chọn phân quyền",
            },
            selSubDepartment: {
                required: "Chọn tổ bộ môn",
            },
            selOffice: {
                required: "Chọn chức vụ",
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