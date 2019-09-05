window.contentfulExtension.init(function (api) {
  function tinymceForContentful (api) {
    api.window.startAutoResizer()

    function tweak (param) {
      var t = param.trim()
      if (t === 'false') {
        return false
      } else if (t === '') {
        return undefined
      } else {
        return t
      }
    }

    function formatColorMap (param) {
      console.log('BLABLABALBLABLLAA')
      param = tweak(param)
      if (!param) return param

      var definitions = param.split(',')
      var map = []

      for (let definition of definitions) {
        const color = definition.split(':')
        map.push(color[0])
        map.push(color[1])
      }

      return map
    }

    var tb = tweak(api.parameters.instance.toolbar)
    var mb = tweak(api.parameters.instance.menubar)
    var cm = formatColorMap(api.parameters.instance.color_map)

    tinymce.init({
      selector: '#editor',
      plugins: api.parameters.instance.plugins,
      toolbar: tb,
      menubar: mb,
      menu: {
        edit: {
          title: 'Edit',
          items: 'undo redo | cut copy paste | selectall | searchreplace'
        },
        insert: {
          title: 'Insert',
          items: 'image link media'
        },
        format: {
          title: 'Format',
          items: 'bold italic underline | forecolor | removeformat'
        },
        tools: {
          title: 'Tools',
          items: 'spellchecker spellcheckerlanguage | code wordcount'
        }
      },
      color_map: cm,
      custom_colors: false,
      max_height: 500,
      min_height: 300,
      autoresize_bottom_margin: 15,
      resize: false,
      init_instance_callback: function (editor) {
        var listening = true

        function getEditorContent () {
          return editor.getContent() || ''
        }

        function getApiContent () {
          return api.field.getValue() || ''
        }

        function setContent (x) {
          var apiContent = x || ''
          var editorContent = getEditorContent()
          if (apiContent !== editorContent) {
            // console.log('Setting editor content to: [' + apiContent + ']');
            editor.setContent(apiContent)
          }
        }

        setContent(api.field.getValue())

        api.field.onValueChanged(function (x) {
          if (listening) {
            setContent(x)
          }
        })

        function onEditorChange () {
          var editorContent = getEditorContent()
          var apiContent = getApiContent()

          if (editorContent !== apiContent) {
            // console.log('Setting content in api to: [' + editorContent + ']');
            listening = false
            api.field
              .setValue(editorContent)
              .then(function () {
                listening = true
              })
              .catch(function (err) {
                console.log('Error setting content', err)
                listening = true
              })
          }
        }

        var throttled = _.throttle(onEditorChange, 500, { leading: true })
        editor.on('change keyup setcontent blur', throttled)
      }
    })
  }

  function loadScript (src, onload) {
    var script = document.createElement('script')
    script.setAttribute('src', src)
    script.onload = onload
    document.body.appendChild(script)
  }

  var sub =
    location.host == 'contentful.staging.tiny.cloud' ? 'cloud-staging' : 'cloud'
  var apiKey = api.parameters.installation.apiKey
  var channel = api.parameters.installation.channel
  var tinymceUrl =
    'https://' +
    sub +
    '.tinymce.com/' +
    channel +
    '/tinymce.min.js?apiKey=' +
    apiKey

  loadScript(tinymceUrl, function () {
    tinymceForContentful(api)
  })
})
