$(document).on('change', 'input[name="delete"]', function() {

    handleCheckAll()
})

function setEventMouseOut(elementId, keyItem) {

    $(document).on('mouseout', elementId, function() {

        sessionStorage.setItem(keyItem, $(this).val())
    })
}

function setValueSession(keyItem, value) {

    sessionStorage.setItem(keyItem, value)
}

function renderSessionValue(elementId, keyItem) {

    $(elementId).val(sessionStorage.getItem(keyItem))
}

//setEventMouseOut('#question', 'questionContent')
$(document).on('mouseout', '#question', function() {

    sessionStorage.setItem('questionContent', $(this).html())
})

setEventMouseOut('#essay', 'essayAnswer')
setEventMouseOut('#optionA', 'optionA')
setEventMouseOut('#optionB', 'optionB')
setEventMouseOut('#optionC', 'optionC')
setEventMouseOut('#optionD', 'optionD')
setEventMouseOut('#selAnswer', 'multiChoicesAnswer')

$(document).on('change', '#selTopic', function() {

    sessionStorage.setItem('topic', $(this).val())
})

$(document).on('change', '#selLevel', function() {

    sessionStorage.setItem('level', $(this).val())
})

// sự kiện nút reset
$(document).on('click', '#btnReset', function() {

    resetQuestionCompilationForm()
})

// hiển thị input file cho người dùng khi muốn đính kèm
$(document).on('click', '#btnAttach', function() {

    openImageDialog()
})

function initQuestionCompilation() {

    $(document).ready(function() {

        let user = JSON.parse(sessionStorage.getItem("user"))
        let lecturerId = user.lecturerId

        sessionStorage.setItem("searchQuestion", STRING_EMPTY)
        
        findAllObjectsByStatus(URL_LEVEL_API, renderLevelListWithChangeToSelect)

        findQuestionTypeByStatus(TOKEN)
        .done(function (data, status, xhr) {

            if (xhr.status == OK) {
                
                renderQuestionTypeListWithChangeToSelect(data)

                //renderSessionValue('#question', 'questionContent')
                $('#question').html(sessionStorage.getItem('questionContent'))
                renderSessionValue('#essay', 'essayAnswer')
                renderSessionValue('#optionA', 'optionA')
                renderSessionValue('#optionB', 'optionB')
                renderSessionValue('#optionC', 'optionC')
                renderSessionValue('#optionD', 'optionD')
                renderSessionValue('#selAnswer', 'multiChoicesAnswer')

                if ($('#selAnswer').val() === null) {

                    $('#selAnswer').val('A')
                }

                if (sessionStorage.getItem('action') == 1) {

                    $('#action').val(1)
                }

                if (sessionStorage.getItem('questionIdHidden') != '') {

                    $('#questionIdHidden').val(sessionStorage.getItem('questionIdHidden'))
                }

                scrollToTop($(".navbar"), $("#backToTopQuestion"))
            }
        }).fail(function () {
            console.log("failed")
        });

        getTotalRecord(URL_QUESTION_API, "searchQuestion")
        findAllObjectsPagination(URL_QUESTION_API, PAGE_FIRST, STRING_EMPTY, renderQuestionList)
    
        if (ROLE == ROLE_ADMIN) {

            findAllObjectsByStatus(URL_SUBJECT_API, renderSubjectListWithChangeToSelect)
        } else {

            findSubjectByLecturerId(TOKEN, lecturerId)
            .done(function (data, status, xhr) {
        
                if (xhr.status == OK) {
        
                    renderSubjectListWithChangeToSelect(data)
                }
            }).fail(function () {
                console.log("failed")
            });
        }
    })
}

$(document).on('change', '.selSubjectQuestion', function() {

    sessionStorage.setItem('subject', $(this).val())

    findTopicBySubjectId(TOKEN, $(this).val()).done(function(data, status, xhr) {
        if (xhr.status == OK) {

            renderTopicListToSelect(data)
        }
    }).fail(function () {
        console.log("failed")
    });
})

$(document).on('change', '.selQuestionTypeQuestion', function() {

    sessionStorage.setItem('questionType', $(this).val())

    let questionTypeId = $(this).val()

    if (questionTypeId == ID_MULTI_CHOICE_OPTION) {
        
        $('#essayAnswer').hide()
        $('#multipleChoiceOptions').show()
    } else if (questionTypeId == ID_ESSAY) {

        $('#multipleChoiceOptions').hide()
        $('#essayAnswer').show()
    } else {
        
        $('#multipleChoiceOptions').hide()
        $('#essayAnswer').hide()
    }
})

$(document).on('click', '#btnSave', function() {

    validateQuestionForm()

    if ($("#frmQuestionCompilation").valid() == false) {
        
        return;
    }

    let questionFormData = new FormData()

    let action = $('#action').val()
    let questionTypeId = $('#selQuestionType').val()

    questionFormData = getQuestionForm(questionTypeId)

    if (action == '') {

        addQuestion(questionFormData)
    } else {

        updateQuestion(questionFormData)
    }

    resetQuestionCompilationForm()
})

$(document).on('click', '#tbodyQuestion td', function() {

    let questionId = $(this).closest('tr').attr('id')

    setValueSession('questionIdHidden', questionId)

    findQuestionByQuestionId(TOKEN, questionId)
    
    $('#questionIdHidden').val(questionId)
    $('#action').val(1)
})

// xu ly su kien cho nut Delete
$(document).on('click', '#btnDeleteQuestion', function() {

    var array = [];
    $.each($("input[name='delete']:checked"), function(){            
        array.push($(this).val());
    });

    let formData = new FormData();
    formData.append('questionIdArray', array)
    formData.append('token', TOKEN)

    if(array != []) {
        removeQuestion(formData)
    }
})

// xử lý sự kiện cho switch button
$(document).on('click', '#tbodyQuestion input[name=switch]', function(e) {

    e.stopPropagation()

    let questionId = $(this).closest('tr').attr('id')

    changeQuestionStatus(questionId, TOKEN)
})

// xu ly su kien search
$(document).on('keyup', '#txtSearchQuestion', function (e) {

    if (e.keyCode === 13) {
        
        let searchString = $.trim($('#txtSearchQuestion').val())

        $('#page').val(1)

        sessionStorage.setItem("searchQuestion", searchString)

        getTotalRecord(URL_QUESTION_API, "searchQuestion")

        findAllObjectsPagination(URL_QUESTION_API, PAGE_FIRST, searchString, renderQuestionList)
    }
})

// xử lý phân trang
// button next
$(document).on('click', '#questionPagination #btnNext', function() {

    let page = $('#page').val()

    let searchString = $.trim(sessionStorage.getItem("searchQuestion"))

    let pageNext = 1 + Number.parseInt(page)
    $('#page').val(pageNext)

    findAllObjectsPagination(URL_QUESTION_API, pageNext, searchString, renderQuestionList)
})

// button previous
$(document).on('click', '#questionPagination #btnPrevious', function() {

    let page = $('#page').val()
    let searchString = $.trim(sessionStorage.getItem("searchQuestion"))

    let pagePrevious = Number.parseInt(page) - 1
    $('#page').val(pagePrevious)

    findAllObjectsPagination(URL_QUESTION_API, pagePrevious, searchString, renderQuestionList)
})

// button first
$(document).on('click', '#questionPagination #btnFirst', function() {

    let pageFirst = PAGE_FIRST
    let searchString = $.trim(sessionStorage.getItem("searchQuestion"))

    $('#page').val(pageFirst)

    findAllObjectsPagination(URL_QUESTION_API, pageFirst, searchString, renderQuestionList)
})

// button last
$(document).on('click', '#questionPagination #btnLast', function() {

    let pageLast =  Number.parseInt($('#pageLast').val())
    let searchString = $.trim(sessionStorage.getItem("searchQuestion"))

    $('#page').val(pageLast)

    findAllObjectsPagination(URL_QUESTION_API, pageLast, searchString, renderQuestionList)
})

// button import file
$(document).on('click', '#btnImportQuestion', function() {

    let questionFormData = getQuestionForm()

    uploadFile(questionFormData)
})

function findQuestionByQuestionId(token, questionId) {
    
    $.ajax({
        url: `${URL_QUESTION_API}/find.id`,
        type: 'GET',
        dataType: 'json',
        data: {
            token: token,
            questionId: questionId
        }
    }).done(function (data, status, xhr) {
        
        if (xhr.status == OK) {

            setValueSession('action', 1)

            let subjectId = data.topic.subject.subjectId
            let topicId = data.topic.topicId
            let questionTypeId = data.questionType.questionTypeId

            // render list first, then is value
            findTopicBySubjectId(TOKEN, subjectId)
            .done(function(data, status, xhr) {
                if (xhr.status == OK) {

                    renderTopicListToSelect(data)

                    $('#selTopic').val(topicId)

                    setValueSession('topic', topicId)
                }
            }).fail(function () {
                console.log("failed")
            });

            findQuestionTypeByStatus(TOKEN)
            .done(function (data, status, xhr) {

                if (xhr.status == OK) {
                    
                    renderQuestionTypeListToSelect(data)

                    $('#selQuestionType').val(questionTypeId)

                    $('#selQuestionType').change()

                    setValueSession('questionType', questionTypeId)
                }
            }).fail(function () {
                console.log("failed")
            });

            $('#selSubject').val(subjectId)
            $('#selLevel').val(data.levelId)
            $('#question').html(data.questionContent)

            setValueSession('subject', subjectId)
            setValueSession('level', data.levelId)

            //setValueSession('questionContent', data.questionContent)
            sessionStorage.setItem('questionContent', data.questionContent)

            if (questionTypeId == ID_MULTI_CHOICE_OPTION) {

                let answers = data.answers

                answers.sort((a, b) => a.answerId.localeCompare(b.answerId))

                $('#optionA').val(answers[0].answerContent)
                $('#optionB').val(answers[1].answerContent)
                $('#optionC').val(answers[2].answerContent)
                $('#optionD').val(answers[3].answerContent)
                $('#selAnswer').val((data.answerCorrect).slice(-1))

                setValueSession('optionA', answers[0].answerContent)
                setValueSession('optionB', answers[1].answerContent)
                setValueSession('optionC', answers[2].answerContent)
                setValueSession('optionD', answers[3].answerContent)
                setValueSession('multiChoicesAnswer', (data.answerCorrect).slice(-1))
            } else if (questionTypeId == ID_ESSAY) {

                let essayAnswer = data.answers.length > 0 ? (data.answers)[0].answerContent : "";

                $('#essay').val(essayAnswer)

                setValueSession('essayAnswer', essayAnswer)
            }
        }
    }).fail(function () {
        console.log("failed")
    });
}

function addQuestion(questionFormData) {

    $.ajax({
        url: `${URL_QUESTION_API}/add`,
        type: 'POST',
        dataType: 'text',
        cache: false,
        contentType: false,
        processData: false,
        data: questionFormData
    }).done(function (data, status, xhr) {

        if (xhr.status == CREATED) {

            let searchString = $.trim(sessionStorage.getItem("searchQuestion"))
            findAllObjectsPagination(URL_QUESTION_API, $('#page').val(), searchString, renderQuestionList)

            resetQuestionCompilationForm()
        }
    }).fail(function () {
        console.log("failed")
    });
}

function updateQuestion(questionFormData) {

    $.ajax({
        url: `${URL_QUESTION_API}/update`,
        type: 'POST',
        dataType: 'text',
        cache: false,
        contentType: false,
        processData: false,
        data: questionFormData
    }).done(function (data, status, xhr) {

        if (xhr.status == OK) {
            
            let searchString = $.trim(sessionStorage.getItem("searchQuestion"))
            findAllObjectsPagination(URL_QUESTION_API, $('#page').val(), searchString, renderQuestionList)

            resetQuestionCompilationForm()
        }
    }).fail(function () {
        console.log("failed")
    });
}

// ham xoa cau hoi
function removeQuestion(formData) {
    
    $.ajax({
        url: `${URL_QUESTION_API}/remove`,
        type: 'POST',
        dataType: 'text',
        cache: false,
        contentType: false,
        processData: false,
        data: formData
    }).done(function (data, status, xhr) {
        
        if (xhr.status == OK) {

            let searchString = $.trim(sessionStorage.getItem("searchQuestion"))
            findAllObjectsPagination(URL_QUESTION_API, $('#page').val(), searchString, renderQuestionList)
        }
    }).fail(function () {
        console.log("failed")
    });
}

// ham thay doi trang thai cua doi tuong
function changeQuestionStatus(questionId, token) {
    
    $.ajax({
        url: `${URL_QUESTION_API}/changeStatus`,
        type: 'POST',
        dataType: 'text',
        data: {
            questionId: questionId,
            token: token
        }
    }).done(function (data, status, xhr) {
        
        if (xhr.status == OK) {

            let searchString = $.trim(sessionStorage.getItem("searchQuestion"))
            findAllObjectsPagination(URL_QUESTION_API, $('#page').val(), searchString, renderQuestionList)
        }
    }).fail(function () {
        console.log("failed")
    });
}

function renderQuestionList(questionList) {

    let tbody = ''

    $.each(questionList, function (index, question) {

        let answerContent = ''
        let answers = question.answers
        let questionTypeId = question.questionType.questionTypeId
        let isMultiChoiceOptions = (questionTypeId == ID_MULTI_CHOICE_OPTION)
        
        if (isMultiChoiceOptions) {

            let answerCorrect = question.answerCorrect
            answers.sort((a, b) => a.answerId.localeCompare(b.answerId))

            $.each(answers, function (index, answer) {
                
                if (answerCorrect == answer.answerId) {

                    answerContent += `<p><b>${index === 0 ? 'A. ' : index === 1 ? 'B. ' : index === 2 ? 'C. ' : 'D. '}${answer.answerContent}</b></p>`
                } else {
                    answerContent += `<p>${index === 0 ? 'A. ' : index === 1 ? 'B. ' : index === 2 ? 'C. ' : 'D. '}${answer.answerContent}</p>`
                }
            })
        } else if (answers.length > 0) {
            
            answerContent = answers[0].answerContent
        }

        tbody += `<tr id="${question.questionId}">
                    <td class="text-center"><input type="checkbox" name="delete" value="${question.questionId}"></td>
                    <td>${question.topic.topicName}</td>
                    <td>${question.questionContent}</td>
                    <td>${answerContent}</td>
                    <td>${new Date(question.timeCreation).toLocaleString('en-GB',{hour12: false})}</td>
                    <td>${question.lecturer.lecturerName}</td>
                    <td align="center"><div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" role="switch" name="switch" ${question.deleted == 0 ? 'checked' : ''}>
                    </div></td>
                </tr>`
    })

    $('#tbodyQuestion').empty().append(tbody)

    if ($('input[name="ckbAll"]').is(':checked')) {

        $('input[name="ckbAll"]').prop('checked', false)
    }
}

function renderTopicListToSelect(topicList) {

    let sel = `<option value='' selected>Chọn chủ đề</option>`
    
    $.each(topicList, function(index, topic) {
        sel += `<option value='${topic.topicId}'>${topic.topicName}</option>`
    })

    $('#selTopic').empty().append(sel)

    let topicIds = topicList.map(function(teaching, index) {
        return topicList[index].topicId;
    })

    // nếu mà có trong topicIds
    if ($.inArray(sessionStorage.getItem('topic'), topicIds) !== -1) {

        $('#selTopic').val(sessionStorage.getItem('topic'))
    }
}

function renderLevelListWithChangeToSelect(levelList) {

    renderLevelListToSelect(levelList)

    $('#selLevel').val(sessionStorage.getItem('level'))
}

function renderQuestionTypeListWithChangeToSelect(questionTypeList) {

    renderQuestionTypeListToSelect(questionTypeList)

    $('#selQuestionType').val(sessionStorage.getItem('questionType'))

    $('#selQuestionType').change()
}

// chỉ clear phần câu hỏi và đáp án
function resetQuestionCompilationForm() {

    $('#question').html('')
    $('#multipleChoiceOptions').val('')
    $('#optionA').val('')
    $('#optionB').val('')
    $('#optionC').val('')
    $('#optionD').val('')
    $('#selAnswer').val('A')
    $('#essay').val('')
    $('#fileImport').val('')

    $('#action').val('')

    setValueSession('action', 0)
    setValueSession('questionIdHidden', '')
}

function getQuestionForm(questionTypeId) {
    
    let questionFormData = new FormData()

    let user = JSON.parse(sessionStorage.getItem('user'))
    let action = $('#action').val()
    let subjectId = $('#selSubject').val()
    let topicId = $('#selTopic').val()
    let levelId = $('#selLevel').val()
    let questionContent = $('#question').html()
    let timeCreation = new Date($.now())
    let fileList = $('#fileImport').prop('files')

    questionFormData.append('token', TOKEN)
    questionFormData.append('action', action)
    questionFormData.append('subjectId', subjectId)
    questionFormData.append('topicId', topicId)
    questionFormData.append('levelId', levelId)
    questionFormData.append('questionTypeId', questionTypeId)
    questionFormData.append('questionContent', questionContent)
    questionFormData.append('timeCreation', timeCreation)
    questionFormData.append('lecturerId', user.lecturerId)
    questionFormData.append('questionId', sessionStorage.getItem('questionIdHidden'))

    if (fileList === undefined) {

        questionFormData.append('fileList',  new File([""], file))
    } else {

        $.each(fileList, function(index, file) {

            questionFormData.append('fileList', file)
        })
    }
    
    if (questionTypeId == ID_MULTI_CHOICE_OPTION) {
        
        let optionA = $('#optionA').val()
        let optionB = $('#optionB').val()
        let optionC = $('#optionC').val()
        let optionD = $('#optionD').val()
        let answerCorrect = $('#selAnswer').val()

        questionFormData.append('optionA', optionA)
        questionFormData.append('optionB', optionB)
        questionFormData.append('optionC', optionC)
        questionFormData.append('optionD', optionD)
        questionFormData.append('answerCorrect', answerCorrect)
    } else if (questionTypeId == ID_ESSAY) {

        let essayAnswer = $('#essay').val()
        questionFormData.append('answerEssay', essayAnswer)
    }

    return questionFormData
}

function renderSubjectListWithChangeToSelect(subjectList) {

    renderSubjectListToSelect(subjectList)

    $('#selSubject').val(sessionStorage.getItem('subject'))

    $('#selSubject').change()
}

function openImageDialog() {
    var input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = function () {
        var file = this.files[0];
        
        uploadImage(file)
    };
    input.click();
}

function uploadImage(fileImage) {
    
    let formData = new FormData()
    formData.append('fileImage', fileImage)
    formData.append('token', TOKEN)

    $.ajax({
        url: `${URL_QUESTION_API}/uploadImage`,
        type: 'POST',
        dataType: 'text',
        cache: false,
        contentType: false,
        processData: false,
        data: formData
    }).done(function (data, status, xhr) {
        
        if (xhr.status == OK) {

            var img = document.createElement("img");
            img.src = data
            img.style.width = '100%'
            img.style.height = '50vh'
            img.style.margin = "0 auto"
            img.style.padding = '3vh'
            img.style.display = "block"
            insertNodeAtCursor(img);

            // resize height for question div
            $('#question').height($('#question').prop('scrollHeight'))
        }
    }).fail(function () {
        console.log("failed")
    });
}

function insertNodeAtCursor(node) {
    var range, html;
    if (window.getSelection && window.getSelection().getRangeAt) {
        range = window.getSelection().getRangeAt(0);
        range.insertNode(node);
    } else if (document.selection && document.selection.createRange) {
        range = document.selection.createRange();
        html = (node.nodeType == 3) ? node.data : node.outerHTML;
        range.pasteHTML(html);
    }
}

function uploadFile(questionFormData) {

    $('.loader_bg').show()

    $.ajax({
        url: `${URL_QUESTION_API}/uploadFile`,
        type: 'POST',
        dataType: 'text',
        cache: false,
        contentType: false,
        processData: false,
        data: questionFormData
    }).done(function (data, status, xhr) {
        
        if (xhr.status == OK) {

            //$('#question').html(data)
            let searchString = $.trim(sessionStorage.getItem("searchQuestion"))
            getTotalRecord(URL_QUESTION_API, "searchQuestion")
            findAllObjectsPagination(URL_QUESTION_API, $('#page').val(), searchString, renderQuestionList)
        
            if (ROLE == ROLE_ADMIN) {

                findAllObjectsByStatus(URL_SUBJECT_API, renderSubjectListWithChangeToSelect)
            } else {

                findSubjectByLecturerId(TOKEN, lecturerId)
                .done(function (data, status, xhr) {
        
                    if (xhr.status == OK) {
            
                        renderSubjectListWithChangeToSelect(data)
                    }
                }).fail(function () {
                    
                    console.log("failed")
                });
            }

            $('#fileImport').val('')

            $('.loader_bg').hide()
        }
    }).fail(function () {

        $('.loader_bg').hide()
        console.log("failed")
    });
}

function validateQuestionForm() {

    $("#frmQuestionCompilation").validate({
        rules: {
            selSubject: {
                required: true
            },
            selTopic: {
                required: true
            },
            selLevel: {
                required: true
            },
            selQuestionType: {
                required: true
            },
            question: {
                required: true
            },
            optionA: {
                required: function (element) {
                    return $("#selQuestionType").val() == ID_MULTI_CHOICE_OPTION;
                }
            },
            optionB: {
                required: function (element) {
                    return $("#selQuestionType").val() == ID_MULTI_CHOICE_OPTION;
                }
            },
            optionC: {
                required: function (element) {
                    return $("#selQuestionType").val() == ID_MULTI_CHOICE_OPTION;
                }
            },
            optionD: {
                required: function (element) {
                    return $("#selQuestionType").val() == ID_MULTI_CHOICE_OPTION;
                }
            }
        },
        messages: {
            selSubject: {
                required: "Chọn học phần"
            },
            selTopic: {
                required: "Chọn chủ đề"
            },
            selLevel: {
                required: "Chọn mức độ"
            },
            selQuestionType: {
                required: "Chọn loại câu hỏi"
            },
            question: {
                required: "Nhập câu hỏi"
            },
            optionA: {
                required: "Nhập đáp án A"
            },
            optionB: {
                required: "Nhập đáp án B"
            },
            optionC: {
                required: "Nhập đáp án C"
            },
            optionD: {
                required: "Nhập đáp án D"
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

