$(document).on('click', '#btnLogin', function (e) {
    
    $("#frmLogin").validate({
        rules: {
            email: {
                required: true,
                email: true
            },
            password: {
                required: true,
            }
        },
        messages: {
            email: {
                required: "Nhập email",
                email: "Email không đúng định dạng"
            },
            password: {
                required: "Nhập mật khẩu"
            }
        },
        highlight: function (element) {
            $(element).closest(".form-group").addClass("has-error");
        },
        unhighlight: function (element) {
            $(element).closest(".form-group").removeClass("has-error");
        }
    });

    if ($("#frmLogin").valid() == false) {
        
        return;
    }

    // if form valid is true, call login method
    login()
});

function login() {
    let email = $("#email").val();
    let password = $("#password").val();
    
    $.ajax({
        url: `${BASE_URL}/api/login`,
        type: 'POST',
        dataType: 'json',
        data: {
            email: email,
            password: password
        }
    }).done(function (data, status, xhr) {

        let token = data.token
        let user = data.user

        sessionStorage.setItem("token", `Bearer ${token}`)
        sessionStorage.setItem("user", JSON.stringify(user))
        sessionStorage.setItem("role", user.account.role.roleName)

        $(location).prop('href', './index.html')
    }).fail(function (data, textStatus, xhr) {
        $('.error').text(data.responseText)
    });
}

