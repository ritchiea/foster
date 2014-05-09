(
  function Annotation(properties){
    this['@context'] = "http://www.w3.org/ns/oa-context-20130208.json"
    this['@type'] = "oa:Annotation"
    // @id optional

    for (var prop in properties) {
      this[prop] = properties[prop]  
    }
  }

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

  function Annotator(options){
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
    this.annotations = options.dataSource || []
    this.serializer = options.serializer || 'https://github.com/ritchiea/foster'
  }

  Annotator.prototype.createAnnotation = function (properties, callback) {

    var newAnnotation = new Annotation(properties)
    this.annotations.push(newAnnotation)
    return newAnnotation
  }

  Reader = function(options) {

  }

  Annotateable = function(options) {

    if (typeof options === 'undefined') { var options = {} }

    // create custom event
    if (window.CustomEvent) {
      var annotationClickEvent = new CustomEvent('foster.clickAnnotateable', {detail: {createAnnotationFromSource: 'true'}});
    } else {
      var annotationClickEvent = document.createEvent('CustomEvent');
      annotationClickEvent.initCustomEvent('foster.clickAnnotateable', true, true, {createAnnotationFromSource: 'true'});
    }

    this.writer = new Annotator(options)

    var annotationClassName = options.annotationClass || 'annotation-element'
    var annotatationElements = document.getElementsByClassName(annotationClassName)
    for (var i = 0; i < annotationElements.length; i++) {
      annotationElements[i].addEventListener('click', function(event) {

        event.target.dispatchEvent(annotationClickEvent);
      })
    }

    var targetEl = document.getElementById(options.selector) || document.getElementByTagName('html')[0]

    targetEl.addEventListener('dragend', function (event){

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
      var dropped = JSON.parse(event.srcElement.dataset.annotation),
      var elem = event.toElement
      dropped.hasTarget = {
        "@id": "", // generate uuid here
        "@type": "oa:SpecificResource", 
        conformsTo: "http://tools.ietf.org/rfc/rfc3236",
        value: elem.id
      }

      writer.createAnnotation(dropped)
    })

    targetEl.addEventListener('mouseup', function (event){ 
      if (typeof window.getSelection !== 'undefined') {
        var selection = window.getSelection
        document.addEventListener('foster.clickAnnotateable', function (evt){
          var exact = selection.toString(),
            prefix = selection.anchorNode.data.substring(0,selection.anchorOffset),
            suffix = selection.focusNode.data.substring(selection.focusOffset,0),
            annotationData = JSON.parse(evt.srcElement.dataset.annotation)
          annotationData.hasTarget = {
            "@type": "oa:SpecificResource", 
            selector: 'oa:TextQuoteSelector',
            exact: exact,
            prefix: prefix,
            suffix: suffix
          }

          writer.createAnnotation(annotationData)
        })
      }
    })
  }

  Annotateable.prototype.getAnnotations = function() {
    return this.writer.annotations
  }

  Annotateable.prototype.getAnnotationsAsRdf = function() {
    var rdf = []
    var annotations = this.writer.annotations
    for (var i = 0; i < annotations.length; i++) {
      rdf.push(annotations[i].toRdf()) 
    }
    return rdf
  }

  window.Foster = Annotateable

)();
