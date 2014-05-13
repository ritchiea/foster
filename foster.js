(function(){

  function Annotation (properties){
    this['@context'] = "http://www.w3.org/ns/oa-context-20130208.json"
    this['@type'] = "oa:Annotation"
    if (typeof properties.annotatedAt === 'undefined') { this['annotatedAt'] = new Date }

    for (var prop in properties) {
      this[prop] = properties[prop]
    }

    this.target = this.hasTarget
    this.body = this.hasBody
  }

  /*
  Annotation.prototype.toRdf = function() {
    // should print in format:
    // 
    // <MyAnnoId> a oa:Annotation ;
    // oa:hasBody <urn:uuid:6C97B503-25EE-4E37-875C-B7C850E13194> ;
    // oa:hasTarget <http://en.wikipedia.org/> .

    // <urn:uuid:6C97B503-25EE-4E37-875C-B7C850E13194> a oa:SpecificResource ;
    // oa:hasSource <http://www.youtube.com/watch?v=uPh81LIe7B8> ;
    // oa:hasSelector <urn:uuid:40F2B17E-7CA2-42C2-B5AF-5F35E5992B8B> .

    // <urn:uuid:40F2B17E-7CA2-42C2-B5AF-5F35E5992B8B> a oa:FragmentSelector ;

    // rdf:value "t=npt:35,60" .
    //
    // example from: http://www.w3.org/community/openannotation/wiki/Cookbook

  }
 */

  function Annotator (options){
    // annotations have a target & a body
    // preferably these will be URIs but a body can be plain text with guid
    // if loaded into a web page, target is current url
    // else URI must be supplied

    if (typeof options === 'undefined') { options = {} }

    var TYPES = {
      dataset: 'dctypes:Dataset',
      image: 'dctypes:Image',
      movingImage: 'dctypes:MovingImage',
      text: 'dctypes:Text',
      sound: 'dctypes:Sound'
    }

    this.targetDocument = options.target || window.location.href
    // this.targetType = options.targetType || TYPES.dataset
    if (typeof options.dataSource === 'undefined') {
      this.annotations = []
    } else {
      this.annotations = this.read(options.dataSource)
    }
    this.serializer = options.serializer || 'https://github.com/ritchiea/foster'
  }

  Annotator.prototype.createAnnotation = function (properties, callback) {

    var newAnnotation = new Annotation(properties)
    if (typeof callback === 'function') { newAnnotation = callback(newAnnotation) }
    this.annotations.push(newAnnotation)
    console.log(newAnnotation)
    return newAnnotation
  }

  Annotator.prototype.read = function (data) {
    if (typeof data === 'string') {
      var list = JSON.parse(data)
    } else {
      var list = data
    }
    if (Array.isArray(list)) {
      var annotations = []
      for (var i = 0; i < list.length; i++) {
        annotations.push(new Annotation(list[i])) 
      }
      return annotations
    } else {
      return []
    }
  }

  function emitAnnotationCreateEvent(element, data) {
    if (window.CustomEvent) {
      var annotationCreated = new CustomEvent('foster.annotationCreate', {bubbles: true, detail: {annotationData: data}})
    } else {
      var annotationCreated = document.createEvent('CustomEvent')
      annotationCreated.initCustomEvent('foster.annotationCreate', true, true, {annotationData: data})
    }

    element.dispatchEvent(annotationCreated)
  }

  function setDragEndListener(element) {
    element.addEventListener('dragend', function (event){

      event.preventDefault()
      event.stopPropagation()

      // the dropped element requires a data attribute with annotation data
      // e.g. <id='stats' data-annotation='{hasBody: "...", annotatedBy: "..."}'>
      //
      // format:
      /* 
       "annotatedBy": {
          "@id": "http://www.example.org/people/person1", 
          "@type": "foaf:Person", 
          "mbox": {
              "@id": "mailto:person1@example.org"
          }, 
          "name": "Person One"
        },

        "hasBody": "http://www.example.org/body1"    
      */
      // examples available:
      // http://www.openannotation.org/spec/core/publishing.html
      //
      var dropped = JSON.parse(event.target.dataset.annotation)
      var elem = event.toElement
      dropped.hasTarget = {
        '@type': 'oa:SpecificResource', 
        hasSelector: {
          // '@id': uuid
          '@type': 'oa:FragmentSelector',
          conformsTo: 'http://tools.ietf.org/rfc/rfc3236',
          // this is going to be tricky
          // probably needs an API & events to assure drop gets a valid value
          value: document.elementFromPoint(event.clientX, event.clientY).getAttribute('id')
        }
      }

      emitAnnotationCreateEvent(elem, dropped)

      _fosterData._writer.createAnnotation(dropped, this.options.onCreate)
    })

  }

  PLUGIN_DEFAULTS = {
    selector: ''
  }

  Annotateable = function (options) {
    window._fosterData = {}

    if (typeof options === 'undefined') { var options = PLUGIN_DEFAULTS }
    this.options = options

    // create custom event
    if (window.CustomEvent) {
      var annotationClickEvent = new CustomEvent('foster.clickAnnotateable', {bubbles: true, detail: {createAnnotationFromSource: 'true'}})
    } else {
      var annotationClickEvent = document.createEvent('CustomEvent')
      annotationClickEvent.initCustomEvent('foster.clickAnnotateable', true, true, {createAnnotationFromSource: 'true'})
    }

    var annotationClassName = options.annotationClass || 'annotation'
    var annotationElements = document.getElementsByClassName(annotationClassName)
    if (annotationElements.length) {
      for (var i = 0; i < annotationElements.length; i++) {

        setDragEndListener(annotationElements[i])

        annotationElements[i].addEventListener('click', function (event) {

          event.target.dispatchEvent(annotationClickEvent)
        })
      }
    }

    _fosterData._writer = this._writer = new Annotator(options)

    var targetEl = document.getElementById(options.selector) || document.getElementByTagName('html')[0]
    
    targetEl.addEventListener('mouseup', function (event){ 

      if (typeof window.getSelection !== 'undefined') {

        var listener = function (evt){
          var selection = window.getSelection()
          var exact = selection.toString(),
            prefix = selection.anchorNode.data.substring(0,selection.anchorOffset),
            suffix = selection.focusNode.data.substring(selection.focusOffset,selection.focusNode.data.length-1),
            annotationData = JSON.parse(evt.target.dataset.annotation)
          annotationData.hasTarget = {
            '@type': 'oa:SpecificResource', 
            hasSelector: { 
              // '@id': uuid
              '@type': 'oa:TextQuoteSelector',
              exact: exact,
              prefix: prefix,
              suffix: suffix 
            }
          }

          emitAnnotationCreateEvent(evt.target, annotationData)

          _fosterData._writer.createAnnotation(annotationData, options.onCreate)
        }

        document.addEventListener('foster.clickAnnotateable', listener, false)

        document.addEventListener('mousedown', function (e) {
          if (!e.target.classList.contains(annotationClassName)) {  
            document.removeEventListener('foster.clickAnnotateable', listener, false)
          } else {
            e.preventDefault()
            e.stopPropagation()
            return false
          }
        })
      }
    })
  }

  Annotateable.prototype.watch = function(element) {
    setDragEndListener.call(this, element)
    return true
  }

  Annotateable.prototype.getAnnotations = function() {
    if (this._writer.annotations.length) { return this._writer.annotations }
  }

  Annotateable.prototype.getAnnotationsAsString = function() {
    if (this._writer.annotations.length) { return JSON.stringify(this._writer.annotations) }
  }

  Annotateable.prototype.getAnnotationsAsRdf = function() {

    if (!this._writer.annotations.length) { 
      return false 
    } else {

      var rdf = []
      var annotations = this._writer.annotations
      for (var i = 0; i < annotations.length; i++) {
        rdf.push(annotations[i].toRdf()) 
      }
      return rdf
    }
  }

  Annotateable.prototype.getSelection = function(annotation, callback) {
    if (typeof annotation.target === 'object') {
      if (annotation.target.hasSelector['@type'] === 'oa:TextQuoteSelector'){  
        var pre_search = document.evaluate('//*[text()[contains(.,"' + annotation.target.hasSelector.prefix + '")]]',document, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null)
        var startElem = pre_search.iterateNext()
        var suf_search = document.evaluate('//*[text()[contains(.,"' + annotation.target.hasSelector.suffix + '")]]',document, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null)
        var endElem = suf_search.iterateNext()
        var range = document.createRange()
        if (startElem == endElem) {

          // this doesn't work the way the docs seem to describe...
          // I thought I would be able to select specific characters
          range.setStart(startElem,0)
          range.setEnd(endElem,1)
          // range.setStart(startElem,annotation.target.hasSelector.prefix.length)
          // range.setEnd(endElem,endElem.textContent.search(annotation.target.hasSelector.suffix)-1)

        }

        callback(range)

      } else if (annotation.target.hasSelector['@type'] === 'oa:FragmentSelector'){  

        // for now this just supports HTML
        elem = document.getElementById(annotation.target.hasSelector.value)
        callback(elem)
      }
    }
  } 


  // USAGE
  //
  // annotator = new Foster({selector: 'doc-to-annotate'})
  // <div id='doc-to-annotate'> ...annotateable stuff... </div>

  window.Foster = Annotateable

}).call(this);
