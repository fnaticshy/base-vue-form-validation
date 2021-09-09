import Vue from 'vue'
import axios from "axios"
import {VueMaskDirective} from 'v-mask'

window.generateId = function () {
  return Math.random().toString(36).substr(2, 9);
}

Vue.directive('mask', VueMaskDirective);

new Vue({
  delimiters: ['{{', '}}'],

  el: '#agent-form',

  data: function () {
    return {
      captcha_sid: null,
      isLoading: false,
      sended: false,
      masks: {
        phone: '+7 (###) ### ## ##',
        date: '##.##.####',
        snils: '###-###-### ##',
        passport: '#### ######'
      },
      actionUrl: '/',
      fields: {
        name: {
          value: '',
          id: null,
          error: {
            triggered: false,
            value: ''
          },
          validate: {
            required: true,
          }
        },
        last_name: {
          value: '',
          id: null,
          error: {
            triggered: false,
            value: ''
          },
          validate: {
            required: true,
          }
        },
        agent: {
          value: '',
          id: null,
          error: {
            triggered: false,
            value: ''
          },
          validate: {
            required: true,
          }
        },
        birth_day: {
          value: '',
          id: null,
          error: {
            triggered: false,
            value: ''
          },
          validate: {
            required: true,
            minLength: 10,
          }
        },
        passport_info: {
          value: '',
          id: null,
          error: {
            triggered: false,
            value: ''
          },
          validate: {
            required: true,
            minLength: 11,
          }
        },
        passport_date: {
          value: '',
          id: null,
          error: {
            triggered: false,
            value: ''
          },
          validate: {
            required: true,
            minLength: 10,
          }
        },
        snils: {
          value: '',
          id: null,
          error: {
            triggered: false,
            value: ''
          },
          validate: {
            required: true,
            minLength: 14
          }
        },
        email: {
          value: '',
          id: null,
          error: {
            triggered: false,
            value: ''
          },
          validate: {
            required: true,
            regEx: /^(([^<>()[\]\\.,;:а-яА-Я\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          }
        },
        phone: {
          value: '',
          id: null,
          error: {
            triggered: false,
            value: ''
          },
          validate: {
            required: true,
            minLength: 18,
          }
        },
        reason: {
          value: '',
          id: null,
          error: {
            triggered: false,
            value: ''
          },
          validate: {
            required: true,
          }
        },
        captcha_word: {
          value: '',
          id: null,
          error: {
            triggered: false,
            value: ''
          },
          validate: {
            required: true,
            minLength: 5,
          }
        },
        is_agree: {
          value: false,
          id: null,
          error: {
            triggered: false,
            value: ''
          },
          validate: {
            required: true,
          }
        }
      },
      serverErrors: []
    }
  },

  computed: {
    isFormValid: function () {
      var isValid = true
      for (var field in this.fields) {
        if (this.fields[field].error.triggered) {
          isValid = false
        }
      }
      return isValid
    },
  },

  methods: {
    submit: function () {
      if (!this.validate()) {
        return
      }

      var fd = new FormData;
      var self = this;
      var params = {
        method: 'POST',
        url: this.actionUrl,
        data: fd,
        headers: {"Content-Type": "multipart/form-data"}
      }

      for (var key in this.fields) {
        fd.append(key, this.fields[key].value);
      }

      fd.append('captcha_sid', this.captcha_sid);

      this.isLoading = true

      axios(params)
        .then(function (resp) {
          if (resp.data.success) {
            self.sended = true
            setTimeout(function () {
              Popup.close('agent-form-popup')
              setTimeout(function () {
                self.sended = false
                self.clearForm()
              }, 350)
            }, 2000)
          } else {
            self.serverErrors = resp.data.errors
          }
          self.isLoading = false
        })
        .catch(function (error) {
          console.error(error)
          self.isLoading = false
        })

    },
    resetErrors: function () {
      for (var field in this.fields) {
        this.fields[field].error.triggered = false
      }
    },
    validateField: function (fieldName) {
      for (var rule in this.fields[fieldName].validate) {
        this.rootValidator(rule, fieldName)
      }
    },
    rootValidator: function (rule, key) {
      //rule = имя правила, key = имя поля
      switch (rule) {
        case 'required':
          var reqVal = typeof this.fields[key].value === "string" ? this.fields[key].value.trim() : this.fields[key].value;
          if (!reqVal && this.fields[key].validate.required) {
            this.fields[key].error.triggered = true
            this.fields[key].error.value = 'Это обязательное поле'
          }
          break;
        case 'minLength':
          if (this.fields[key].value.length < this.fields[key].validate[rule] && !this.fields[key].error.triggered) {
            this.fields[key].error.triggered = true
            this.fields[key].error.value = 'Заполнено некорректно'
          }
          break;
        case 'regEx':
          if (
            !this.fields[key].validate[rule].test(this.fields[key].value)
            && !this.fields[key].error.triggered
          ) {
            this.fields[key].error.triggered = true
            if (key === 'email') {
              this.fields[key].error.value = 'Некорректный email'
            }
          }
          break;
      }
    },
    validate: function () {
      this.resetErrors()

      for (var key in this.fields) {
        for (var rule in this.fields[key].validate) {
          this.rootValidator(rule, key)
          // break
        }
      }

      return this.isFormValid;
    },
    clearForm: function () {
      for (var key in this.fields) {
        this.fields[key].value = key === 'is_agree' ? false : ''
        this.fields[key].error.triggered = false
        this.fields[key].error.value = 'false'
      }
    },
    clearError: function (key) {
      this.fields[key].error.triggered = false
      this.fields[key].error.value = ''
    },
    blurHandler: function (key) {
      this.validateField(key)
    },
    setAgreeValue: function () {
      this.clearError('is_agree');
      this.fields.is_agree.value = !this.fields.is_agree.value
    },
    openPopupSetName: function (name) {
      this.fields.agent.value = name
      this.captcha_sid = this.$refs.captcha_sid.value
      Popup.open('agent-form-popup')
    }
  },

  created: function () {
    for (var key in this.fields) {
      this.fields[key].id = window.generateId()
    }
  },

  beforeMount: function () {
    var clearAgentForm = function (ctx) {
      return function () {
        ctx.clearForm();
      }
    }

    window.addEventListener('clear-agent-form-popup', clearAgentForm(this))
  }

})
