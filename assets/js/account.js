$(document).on('click', '#btnChangePassword', function () {

    let user = JSON.parse(sessionStorage.getItem('user'))
    let password = user.account.password
    let email = user.email
    let currentPassword = $('#txtCurrentPassword').val()
    let newPassword = $('#txtNewPassword').val()
    let confirmPassword = $('#txtConfirmPassword').val()

    let formData = new FormData()

    formData.append('token', TOKEN)
    formData.append('email', email)
    formData.append('currentPassword', currentPassword)
    formData.append('newPassword', newPassword)
    formData.append('confirmPassword', confirmPassword)

    validateForm(password)

    if ($("#frmChangePassword").valid() == false) {

        return;
    }

    if (password === currentPassword) {

        changePassword(formData)
    } else {

        $('#passwordError').show()
    }
})

function resetForm() {

    $('#frmChangePassword').trigger('reset')
}

function changePassword(formData) {

    $.ajax({
        url: `${URL_LECTURER_API}/changePassword`,
        type: 'POST',
        dataType: 'text',
        cache: false,
        contentType: false,
        processData: false,
        data: formData
    }).done(function (data, status, xhr) {

        if (xhr.status == OK) {

            let user = JSON.parse(sessionStorage.getItem('user'))
            user.account.password = formData.get('newPassword')
            sessionStorage.setItem('user', JSON.stringify(user))

            $(location).prop('href', '../index.html')
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        console.log(textStatus);
        console.log(errorThrown);
        console.log("failed")
    });
}

function validateForm() {

    $("#frmChangePassword").validate({
        rules: {
            current_password: {
                required: true
            },
            new_password: {
                required: true,
            },
            confirm_password: {
                required: true,
                equalTo: "#txtNewPassword"
            }
        },
        messages: {
            current_password: {
                required: "Nhập mật khẩu",
                equalTo: "Mật khẩu không đúng"
            },
            new_password: {
                required: "Nhập mật khẩu mới"
            },
            confirm_password: {
                required: "Nhập lại mật khẩu mới",
                equalTo: "Mật khẩu mới không khớp"
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