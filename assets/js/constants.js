//const BASE_URL = "https://localhost:8443/exam"
const BASE_URL = "https://questionexambank.herokuapp.com/"

const BASE_URL_API = `${BASE_URL}/api`
const URL_DEPARTMENT_API = `${BASE_URL_API}/department`
const URL_LECTURER_API = `${BASE_URL_API}/lecturer`
const URL_ROLE_API = `${BASE_URL_API}/role`
const URL_SUBJECT_API = `${BASE_URL_API}/subject`
const URL_OFFICE_API = `${BASE_URL_API}/office`
const URL_TOPIC_API = `${BASE_URL_API}/topic`
const URL_SUB_DEPARTMENT_API = `${BASE_URL_API}/sub-department`
const URL_LEVEL_API = `${BASE_URL_API}/level`
const URL_QUESTION_TYPE_API = `${BASE_URL_API}/question-type`
const URL_QUESTION_API = `${BASE_URL_API}/question`
const URL_EXAM_API = `${BASE_URL_API}/exam`

const OK = 200
const CREATED = 201
const CONFLICT = 409

const PAGE_FIRST = 1
const MAX_RESULT = 5

const STRING_EMPTY = ""
const ROLE_ADMIN = "Admin"
const ID_MULTI_CHOICE_OPTION = "TN" 
const ID_ESSAY = "TL"

const ID_ADMIN = 1
const ID_SUB_DEPARTMENT_LEDER = 2
const ID_LECTURER = 3

const TOKEN = sessionStorage.getItem("token")
const ROLE = sessionStorage.getItem("role")
const LECTURER_ID = JSON.parse(sessionStorage.getItem("user")).lecturerId
