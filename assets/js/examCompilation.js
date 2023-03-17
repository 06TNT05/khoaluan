function initExamCompilation() {

    $(document).ready(function() {

        let user = JSON.parse(sessionStorage.getItem("user"))
        let lecturerId = user.lecturerId

        sessionStorage.setItem("searchQuestion", STRING_EMPTY)

        findQuestionTypeByStatus(TOKEN)
        .done(function (data, status, xhr) {

            if (xhr.status == OK) {
                
                renderQuestionTypeListToSelect(data)

                scrollToTop($(".navbar"), $("#backToTopExam"))

                $('#examContent').css('overflow-y', '')
                $('#ckbExamType').change()

                $('#examPDF').hide()
            }
        })

        if (ROLE == ROLE_ADMIN) {

            findAllObjectsByStatus(URL_SUBJECT_API, renderSubjectListToSelect)
        } else {

            findSubjectByLecturerId(TOKEN, lecturerId)
            .done(function (data, status, xhr) {
        
                if (xhr.status == OK) {
        
                    renderSubjectListToSelect(data)
                }
            }).fail(function () {
                console.log("failed")
            });
        }
    })
}

$(document).on('change', '#ckbExamType', function() {

    let formData = JSON.parse(sessionStorage.getItem('dataCreationExam'))

    formData.examType = $(this).is(':checked') ? $(this).val() : 0

    sessionStorage.setItem('dataCreationExam', JSON.stringify(formData))
})

$(document).on('change', '#selSubject', function() {

    findTopicBySubjectId(TOKEN, $(this).val()).done(function(data, status, xhr) {
        if (xhr.status == OK) {

            renderTopicListToDiv(data)
        }
    }).fail(function () {
        console.log("failed")
    });
})

$(document).on('click', '#btnViewExam', function() {

    validateExamForm()

    if ($("#frmExamCompilation").valid() == false) {
        
        return;
    }

    let formData = getExamForm(TOKEN, ROLE);

    randomCreationExam(formData)

    $('#containerBtnAddExam').html(`<button type="button" class="btn btn-danger me-3" id="btnExport" style="width: 7vw;">Xuất file</button>
    <button type="button" class="btn btn-success" id="btnSaveExam" style="width: 7vw;">Lưu đề</button>`)

    formData.createdLecturerId = LECTURER_ID
    
    sessionStorage.setItem('dataCreationExam', JSON.stringify(formData))
})

$(document).on('click', '#btnSaveExam', function() {

    // validateScoreForm()

    // if ($("#frmScore").valid() == false) {
        
    //     return;
    // }

    let examFormData = JSON.parse(sessionStorage.getItem('dataCreationExam'))
    examFormData.timeCreation = new Date(Date.now())
    examFormData.examQuestionIdList = []

    $.each($('#examContent > p.question'), function(index, question) {

        let examQuestionId = {}
        let questionId = $(question).attr('id')
        let score = Number.parseInt($(this).find('input[name="score"]').val())

        examQuestionId[questionId] = score > 0 ? score : null
        examFormData.examQuestionIdList.push(examQuestionId)
    })

    addExam(examFormData)

    sessionStorage.removeItem('dataCreationExam')
})

$(document).on('click', '#btnExport', function() {

    let examFormData = JSON.parse(sessionStorage.getItem('dataCreationExam'))
    let examContent = ``
    let html = `<!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">
                    <title>Mẫu đề thi</title>
                    <style>
                        body { 
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                            font-size: 100%;
                            font-family: "Times New Roman", Times, serif;
                        }

                        .test {
                            margin-top: -80px;
                            margin-left: 140px;
                            border: #003300 1px solid;
                            padding-bottom: 55px;
                        }

                        p, span {
                            page-break-inside: avoid;
                        }

                        .essayQuestion {
                            margin-left: 40px;
                        }
                    </style>
                </head>
                <body>
                <div id="examPDF" class="mx-3">`

    findSubjectBySubjectId(examFormData.subjectId, examFormData.token)
    .done(function (data, status, xhr) {

        if (xhr.status == OK) {

            $('#departmentName').empty().text(data.subDepartment.department.departmentName)
            $('#subjectName').empty().text(data.subjectName)
            $('#subjectId').empty().text(data.subjectId)
            $('#credit').empty().text(data.creditQuantity)

            // xử lý border input điểm
            if (examFormData.questionTypeId == ID_ESSAY) {

                $.each($('input[name="score"]'), function (index, input) {

                    let value = $(input).val()
                    
                    let span = $(input).prev('span#number')

                    $(span).html(`${span.text()} <span class="fw-bold">(${value} điểm)</span>`)

                    $(input).removeClass('d-inline-block')

                    $(input).hide()
                })
            }

            if (examFormData.examType == 1) {

                $('#ckbYes').attr('checked', 'checked')
                $('#ckbNo').removeAttr('checked')
            } else {
        
                $('#ckbNo').attr('checked', 'checked')
                $('#ckbYes').removeAttr('checked')
            }

            examContent = $('#examContent').html()
            $('#examContentForm').empty().html(examContent)

            html += $('#examPDF').html()
            html += `</div>
                    </body>
                    </html>`
            exportPDF(html)
        }
    }).fail(function () {
        console.log("failed")
    });

    $('#examNameParagraph').empty().text(examFormData.examName)
    $('#classNumber').empty().text(examFormData.classNumber)
    $('#examTime').empty().text(examFormData.examTime)
})

function exportPDF(html) {

    var opt = {
        margin: [0.8,0.8,0.9,0.8],
        filename: 'exam.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'avoid-all' }
    };

    $.each($('input[name="score"]'), function (index, input) {

        $(input).prev('span#number').text('')
        $(input).addClass('d-inline-block')
    })

    html2pdf(html, opt);
    

    // $.ajax({
    //     url: `${URL_EXAM_API}/export`,
    //     type: 'POST',
    //     xhrFields: {
    //         responseType: 'arraybuffer' // set the response type to arraybuffer
    //     },
    //     cache: false,
    //     contentType: false,
    //     processData: false,
    //     data: formData
    // }).done(function (data, status, xhr) {

    //     if (xhr.status == OK) {

    //         var blob = new Blob([data], { type: "application/pdf" });
    //         var url = URL.createObjectURL(blob);
    //         var link = document.createElement('a');
    //         link.href = url;
    //         link.download = 'exam.pdf';
    //         link.click();
    //     }
    // }).fail(function (jqXHR, textStatus, errorThrown) {
    //     console.log(textStatus);
    //     console.log(errorThrown);
    //     console.log("failed")
    // });
}

function findSubjectBySubjectId(subjectId, token) {

    return $.ajax({
        url: `${URL_SUBJECT_API}/find.id`,
        type: 'GET',
        dataType: 'json',
        data: {
            subjectId: subjectId,
            token: token
        }
    })
}

function addExam(examFormData) {

    $.ajax({
        url: `${URL_EXAM_API}/add`,
        type: 'POST',
        dataType: 'text',
        data: examFormData
    }).done(function (data, status, xhr) {

        if (xhr.status == OK) {
            
            $('#examContent').css('overflow-y', '')
            resetExamForm();
        }
    }).fail(function () {
        console.log("failed")
    });
}

function randomCreationExam(formData) {

    $('.loader_bg').show()

    $.ajax({
        url: `${URL_EXAM_API}/random-creation`,
        type: 'GET',
        dataType: 'json',
        data: formData
    }).done(function (data, status, xhr) {

        if (xhr.status == OK) {

            let questionTypeId = formData.questionTypeId

            let html = ``

            if (questionTypeId == ID_MULTI_CHOICE_OPTION) {

                $.each(data, function(index, question) {
                    
                    html += `<p class="text-justify mb-0 question d-block" id="${question.questionId}">
                    <span class="fw-bold">Câu ${index + 1}:</span>
                    <span id="number"></span> ${question.questionContent}</p>`
    
                    let answers = question.answers
                    answers.sort((a, b) => a.answerId.localeCompare(b.answerId))
    
                    html += `<p class="m-0 d-block">A. ${answers[0].answerContent}</p>
                        <p class="m-0 d-block">B. ${answers[1].answerContent}</p>
                        <p class="m-0 d-block">C. ${answers[2].answerContent}</p>
                        <p class="d-block">D. ${answers[3].answerContent}</p>`

                })

            } else {

                $.each(data, function(index, question) {

                    html += `<p class="text-justify mb-0 question d-block" id="${question.questionId}">
                        <span class="fw-bold">Câu ${index + 1}:</span><span id="number"></span>
                        <input type="number" name="score" class="form-control w-25 d-inline-block" value="0" placeholder="Nhập điểm"></p>`

                    html += `<div class="essayQuestion">${question.questionContent}</div>`
                })
            }

            $('#examContent').empty().html(html)

            if ($('#examContent').html().length > 0) {

                $('#examContent').css('overflow-y', 'scroll')
            }

            $('.loader_bg').hide()
        }
    }).fail(function () {
        console.log("failed")

        $('.loader_bg').hide()
    });
}

function getExamForm(token, role) {

    let formData = {};
    formData.token = token
    formData.role = role
    formData.questionTypeId = $("#selQuestionType").val()
    formData.subjectId = $("#selSubject").val()
    formData.examTime = $("#txtTime").val()
    formData.examName = $("#txtExamName").val()
    formData.classNumber = $('#txtClassNumber').val()
    formData.examType = $('#ckbExamType').is(':checked') ? $('#ckbExamType').val() : 0
    formData.topics = [];
    $(".topic").each(function () {

        let topicData = {};
        //topicData.name = $(this).find(".topic-name").text();
        $(this).find(".option").each(function () {
            let optionId = $(this).find("input").attr("id");
            let optionValue = $(this).find("input").val();

            if (optionValue > 0) {
                topicData[optionId] = optionValue;
            }
        });

        formData.topics.push(topicData);
    });

    return formData;
}
 
function renderTopicListToDiv(topicList) {

    let html = ''
    if (topicList.length != 0) {
        html += `<div class="row mt-3">
                        <span class="col"></span>
                        <span class="col">Mức thấp</span>
                        <span class="col">Mức trung bình</span>
                        <span class="col">Mức cao</span>
                    </div>`

        $.each(topicList, function (index, topic) {

            html += `<div class="row mt-3 topic">
                        <span class="col topic-name">${topic.topicName}</span>
                        <span class="col option">
                            <input class="form-control py-1" value="0" min="0" type="number" 
                                name="${topic.topicId}" id="${topic.topicId}_L" style="width: 7vw;">
                        </span>
                        <span class="col option">
                            <input class="form-control py-1" value="0" min="0" type="number"
                                name="${topic.topicId}" id="${topic.topicId}_M" style="width: 7vw;">
                        </span>
                        <span class="col option">
                            <input class="form-control py-1" value="0" min="0" type="number"
                                name="${topic.topicId}" id="${topic.topicId}_H" style="width: 7vw;">
                        </span>
                    </div>`
        })

        html += `<div class="row mt-3">
                    <div class="col-9"></div>
                    <div class="col-3"><button type="button" class="btn btn-primary" id="btnViewExam" style="width: 7vw;">Xem đề</button></div>
                </div>`
        $('#divTopic').empty().append(html)
    } else {

        html += `<p class="text-center mt-3">Không có chủ đề</p>`
        $('#divTopic').empty().append(html)
    }
}

function resetExamForm() {
    $('#frmExamCompilation').trigger('reset')
    $('#examContent').empty()
    $('#containerBtnAddExam').empty()
    $('#divTopic').empty().html(`<p class="text-center mt-3">Không có chủ đề</p>`)
}

function validateExamForm() {
    
    $("#frmExamCompilation").validate({
        rules: {
            txtExamName: {
                required: true
            },
            txtTime: {
                required: true,
                min: 1
            },
            selSubject: {
                required: true
            },
            selQuestionType: {
                required: true
            },
            classNumber: {
                required: true,
                min: 1
            }
        },
        messages: {
            txtExamName: {
                required: "Nhập tên đề thi"
            },
            txtTime: {
                required: "Nhập thời gian thi",
                min: "Thời gian thi phải lớn hơn 0"
            },
            selSubject: {
                required: "Chọn học phần"
            },
            selQuestionType: {
                required: "Chọn loại câu hỏi"
            },
            classNumber: {
                required: "Nhập khóa",
                min: "Khóa phải lớn hơn 0"
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

function validateScoreForm() {

    $("#frmScore").validate({
        rules: {
            score: {
                required: function(element) {

                    return $('#selQuestionType').val() == ID_ESSAY;
                }
            }
        },
        messages: {
            score: {
                required: "Nhập điểm"
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