(function Annotation(properties){
  this['@context'] = "http://www.w3.org/ns/oa-context-20130208.json"
  this['@id'] = "http://www.example.org/annotations/anno1"
  this['@type'] = "oa:Annotation"

  for (var prop in properties) {
    this[prop] = properties[prop]  
  }
}

Annotation.prototype.serialize = function() {
  // should print in format:
  // 
  // <x:MyAnno> a oa:Annotation ;
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
  this.targetType = options.targetType || TYPES.dataset
  this.annotations = options.source || []
  this.serializer = options.serializer || 'https://github.com/ritchiea/foster'
  // annotator should be in format { email: 'foo@example.com', name: 'Foo Annotator' }
  // any custom fields would require a URI to an RDF vocabulary
}

Annotator.prototype.createAnnotation = function (body, callback) {
    
  var newAnnotation = {
    target: {
      uri: targetDocument,
      type: targetType
    }
    body: {
      // expected URI or plain text
      // if plain text, uuid is necessary
      bodyData: body,
      annotatedAt: new Date,
      annotatedBy: this.annotatedBy,
      serializedBy: this.serializer,
      serializedAt: new Date
    }
  }

  this.annotations.push(newAnnotation)

  return newAnnotation
}

Reader = function(options) {

}

Annotateable = function(options) {

  if (typeof options === 'undefined') { var options = {} }

  this.writer = new Annotator(options)

  var selector = options.selector
  var targetEl = document.getElementById(selector) || document.getElementByTagName('html')[0]

  targetEl.addEventListener('dragend', function (event){
  
    event.preventDefault()
    event.stopPropagation()

    // the dropped element requires a data attribute with annotation data
    // e.g. <id='stats' data-annotation-data='{hasBody: "...", annotatedBy: "..."}'>
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
    var dropped = JSON.parse(event.srcElement.dataset.annotationData)

    writer.createAnnotation(dropped)
  })
}

Annotateable.prototype.getAnnotations = function() {
  return this.writer.annotations
}

window.Foster = Annotateable

  )();


/* example of event.srcElement 
 *
  srcElement: img
  accessKey: ""
  align: ""
  alt: ""
  attributes: NamedNodeMap
  baseURI: "http://www.openannotation.org/spec/core/specific.html"
  border: ""
  childElementCount: 0
  childNodes: NodeList[0]
  children: HTMLCollection[0]
  classList: DOMTokenList
  className: ""
  clientHeight: 509
  clientLeft: 0
  clientTop: 0
  clientWidth: 600
  complete: true
  contentEditable: "inherit"
  crossOrigin: ""
  dataset: DOMStringMap
  dir: ""
  draggable: true
  firstChild: null
  firstElementChild: null
  height: 509
  hidden: false
  hspace: 0
  id: ""
  innerHTML: ""
  innerText: ""
  isContentEditable: false
  isMap: false
  lang: ""
  lastChild: null
  lastElementChild: null
  localName: "img"
  longDesc: ""
  lowsrc: ""
  name: ""
  namespaceURI: "http://www.w3.org/1999/xhtml"
  naturalHeight: 836
  naturalWidth: 986
  nextElementSibling: br
  nextSibling: text
  nodeName: "IMG"
  nodeType: 1
  nodeValue: null
  offsetHeight: 509
  offsetLeft: 215
  offsetParent: body
  offsetTop: 4748
  offsetWidth: 600
  onabort: null
  onbeforecopy: null
  onbeforecut: null
  onbeforepaste: null
  onblur: null
  oncancel: null
  oncanplay: null
  oncanplaythrough: null
  onchange: null
  onclick: null
  onclose: null
  oncontextmenu: null
  oncopy: null
  oncuechange: null
  oncut: null
  ondblclick: null
  ondrag: null
  ondragend: null
  ondragenter: null
  ondragleave: null
  ondragover: null
  ondragstart: null
  ondrop: null
  ondurationchange: null
  onemptied: null
  onended: null
  onerror: null
  onfocus: null
  oninput: null
  oninvalid: null
  onkeydown: null
  onkeypress: null
  onkeyup: null
  onload: null
  onloadeddata: null
  onloadedmetadata: null
  onloadstart: null
  onmousedown: null
  onmouseenter: null
  onmouseleave: null
  onmousemove: null
  onmouseout: null
  onmouseover: null
  onmouseup: null
  onmousewheel: null
  onpaste: null
  onpause: null
  onplay: null
  onplaying: null
  onprogress: null
  onratechange: null
  onreset: null
  onresize: null
  onscroll: null
  onsearch: null
  onseeked: null
  onseeking: null
  onselect: null
  onselectstart: null
  onshow: null
  onstalled: null
  onsubmit: null
  onsuspend: null
  ontimeupdate: null
  onvolumechange: null
  onwaiting: null
  onwebkitfullscreenchange: null
  onwebkitfullscreenerror: null
  onwheel: null
  outerHTML: "<img src="images/fragmentselector.png" width="600px">"
  outerText: ""
  ownerDocument: document
  parentElement: div.diagram
  parentNode: div.diagram
  prefix: null
  previousElementSibling: null
  previousSibling: text
  scrollHeight: 509
  scrollLeft: 0
  scrollTop: 0
  scrollWidth: 600
  spellcheck: true
  src: "http://www.openannotation.org/spec/core/images/fragmentselector.png"
  srcset: ""
  style: CSSStyleDeclaration
  tabIndex: -1
  tagName: "IMG"
  textContent: ""
  title: ""
  translate: true
  useMap: ""
  vspace: 0
  webkitShadowRoot: null
  webkitdropzone: ""
  width: 600
  x: 215
  y: 4748
*/
