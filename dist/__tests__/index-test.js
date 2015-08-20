'use strict';

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var React = require('react');
var assert = require('assert');
var a11y = require('../index');
var assertions = require('../assertions');

var k = function k() {};

var captureWarnings = function captureWarnings(fn) {
  var _warn = console.warn;
  var msgs = {};
  console.warn = function (id, msg, srcNode) {
    msgs[msg] = srcNode ? srcNode : true;
  };
  fn();
  console.warn = _warn;
  return msgs;
};

var expectWarning = function expectWarning(expected, fn) {
  var msgs = captureWarnings(fn);
  assert(msgs[expected], 'Did not get expected warning "' + expected + '"\ngot these warnings:\n' + _Object$keys(msgs).join('\n'));
};

var doNotExpectWarning = function doNotExpectWarning(notExpected, fn) {
  var msgs = captureWarnings(fn);
  assert(msgs[notExpected] == null, 'Did not expect a warning but got "' + notExpected + '"');
};

describe('props', function () {
  var createElement = React.createElement;

  before(function () {
    a11y(React);
  });

  after(function () {
    React.createElement = createElement;
  });

  describe('onClick', function () {
    describe('when role="button"', function () {
      it('requires onKeyDown', function () {
        expectWarning(assertions.props.onClick.BUTTON_ROLE_SPACE.msg, function () {
          React.createElement('span', { onClick: k, role: 'button' });
        });
      });

      it('requires onKeyDown', function () {
        expectWarning(assertions.props.onClick.BUTTON_ROLE_ENTER.msg, function () {
          React.createElement('span', { onClick: k, role: 'button' });
        });
      });
    });

    it('warns without role', function () {
      expectWarning(assertions.props.onClick.NO_ROLE.msg, function () {
        React.createElement('div', { onClick: k });
      });
    });

    it('does not warn with role', function () {
      doNotExpectWarning(assertions.props.onClick.NO_ROLE.msg, function () {
        React.createElement('div', { onClick: k, role: 'button' });
      });
    });

    it('does not warn with no role and `aria-hidden="true"`', function () {
      doNotExpectWarning(assertions.props.onClick.NO_ROLE.msg, function () {
        React.createElement('a', { 'aria-hidden': 'true', onClick: k });
      });
    });
  });

  describe('tabIndex', function () {
    describe('when element is not interactive', function () {
      it('warns without tabIndex', function () {
        expectWarning(assertions.props.onClick.NO_TABINDEX.msg, function () {
          React.createElement('div', { onClick: k });
        });
      });

      it('does not warn when tabIndex is present', function () {
        doNotExpectWarning(assertions.props.onClick.NO_TABINDEX.msg, function () {
          React.createElement('div', { onClick: k, tabIndex: '0' });
        });
      });

      it('does not warn when tabIndex is present', function () {
        doNotExpectWarning(assertions.props.onClick.NO_TABINDEX.msg, function () {
          React.createElement('div', { onClick: k, tabIndex: 0 });
        });
      });
    });

    describe('when element is interactive', function () {
      it('does not warn about tabIndex with a[href]', function () {
        doNotExpectWarning(assertions.props.onClick.NO_TABINDEX.msg, function () {
          React.createElement('a', { onClick: k, href: 'foo' });
        });
      });

      it('does not warn about buttons', function () {
        doNotExpectWarning(assertions.props.onClick.NO_TABINDEX.msg, function () {
          React.createElement('button', { onClick: k });
        });
      });
    });
  });

  describe('aria-hidden', function () {
    describe('when set to `true`', function () {
      it('warns when applied to an interactive element without `tabIndex="-1"`', function () {
        expectWarning(assertions.props['aria-hidden'].TABINDEX_REQUIRED_WHEN_ARIA_HIDDEN.msg, function () {
          React.createElement('a', { 'aria-hidden': 'true', href: '/foo' });
        });
      });

      it('warns when applied to an interactive element with `tabIndex="0"`', function () {
        expectWarning(assertions.props['aria-hidden'].TABINDEX_REQUIRED_WHEN_ARIA_HIDDEN.msg, function () {
          React.createElement('a', { 'aria-hidden': 'true', tabIndex: '0' });
        });
      });

      it('does not warn when applied to a placeholder link', function () {
        expectWarning(assertions.props['aria-hidden'].TABINDEX_REQUIRED_WHEN_ARIA_HIDDEN.msg, function () {
          React.createElement('a', { 'aria-hidden': 'true' });
        });
      });

      it('does not warn when applied to an interactive element with `tabIndex="-1"`', function () {
        doNotExpectWarning(assertions.props['aria-hidden'].TABINDEX_REQUIRED_WHEN_ARIA_HIDDEN.msg, function () {
          React.createElement('a', { 'aria-hidden': 'true', tabIndex: '-1' });
        });
      });

      it('does not warn when applied to a non-interactive element', function () {
        doNotExpectWarning(assertions.props['aria-hidden'].TABINDEX_REQUIRED_WHEN_ARIA_HIDDEN.msg, function () {
          React.createElement('div', { 'aria-hidden': 'true' });
        });
      });
    });

    describe('when set to `false`', function () {
      it('does not warn when applied to an interactive element with `tabIndex="-1"`', function () {
        doNotExpectWarning(assertions.props['aria-hidden'].TABINDEX_REQUIRED_WHEN_ARIA_HIDDEN.msg, function () {
          React.createElement('a', { 'aria-hidden': 'false', tabIndex: '-1' });
        });
      });
    });
  });
});

describe('tags', function () {
  var createElement = React.createElement;

  before(function () {
    a11y(React);
  });

  after(function () {
    React.createElement = createElement;
  });

  describe('img', function () {
    it('requires alt attributes', function () {
      expectWarning(assertions.tags.img.MISSING_ALT.msg, function () {
        React.createElement('img', { src: 'foo.jpg' });
      });
    });

    it('ignores proper alt attributes', function () {
      doNotExpectWarning(assertions.tags.img.MISSING_ALT.msg, function () {
        React.createElement('img', { src: 'foo.jpg', alt: 'a foo, ofc' });
      });
    });

    it('dissallows the word "image" in the alt attribute', function () {
      expectWarning(assertions.tags.img.REDUNDANT_ALT.msg, function () {
        React.createElement('img', { src: 'cat.gif', alt: 'image of a cat' });
      });
    });

    it('dissallows the word "picture" in the alt attribute', function () {
      expectWarning(assertions.tags.img.REDUNDANT_ALT.msg, function () {
        React.createElement('img', { src: 'cat.gif', alt: 'picture of a cat' });
      });
    });
  });

  describe('a', function () {
    describe('placeholder links without href', function () {
      it('does not warn', function () {
        doNotExpectWarning(assertions.tags.a.HASH_HREF_NEEDS_BUTTON.msg, function () {
          React.createElement('a', { 'class': 'foo' });
        });
      });
    });

    describe('placeholder links without tabindex', function () {
      it('does not warn', function () {
        doNotExpectWarning(assertions.tags.a.TABINDEX_NEEDS_BUTTON.msg, function () {
          React.createElement('a', { 'class': 'foo' });
        });
      });
    });

    describe('with [href="#"]', function () {
      it('warns', function () {
        expectWarning(assertions.tags.a.HASH_HREF_NEEDS_BUTTON.msg, function () {
          React.createElement('a', { onClick: k, href: '#' });
        });
      });
    });

    describe('with [tabIndex="0"] and no href', function () {
      it('warns', function () {
        expectWarning(assertions.tags.a.TABINDEX_NEEDS_BUTTON.msg, function () {
          React.createElement('a', { onClick: k, tabIndex: '0' });
        });
      });
    });

    describe('with a real href', function () {
      it('does not warn', function () {
        doNotExpectWarning(assertions.tags.a.HASH_HREF_NEEDS_BUTTON.msg, function () {
          React.createElement('a', { onClick: k, href: '/foo/bar' });
        });
      });
    });
  });
});

describe('labels', function () {
  var createElement = React.createElement;
  var fixture;

  before(function () {
    a11y(React);
  });

  after(function () {
    React.createElement = createElement;
  });

  beforeEach(function () {
    fixture = document.createElement('div');
    fixture.id = 'fixture-1';
    document.body.appendChild(fixture);
  });

  afterEach(function () {
    fixture = document.getElementById('fixture-1');
    if (fixture) document.body.removeChild(fixture);
  });

  it('warns if there is no label on an interactive element', function () {
    expectWarning(assertions.render.NO_LABEL.msg, function () {
      React.createElement('button', null);
    });
  });

  it('warns if there is no label on a placeholder link', function () {
    expectWarning(assertions.render.NO_LABEL.msg, function () {
      React.createElement('a', null);
    });
  });

  it('does not warn when a placeholder link has a label', function () {
    doNotExpectWarning(assertions.render.NO_LABEL.msg, function () {
      React.createElement(
        'a',
        null,
        'foo'
      );
    });
  });

  it('warns if there is no label on an element with an ARIA role', function () {
    expectWarning(assertions.render.NO_LABEL.msg, function () {
      React.createElement('span', { role: 'button' });
    });
  });

  it('does not warn when `role="presentation"`', function () {
    doNotExpectWarning(assertions.render.NO_LABEL.msg, function () {
      React.createElement('img', { role: 'presentation' });
    });
  });

  it('does not warn when `role="none"`', function () {
    doNotExpectWarning(assertions.render.NO_LABEL.msg, function () {
      React.createElement('img', { role: 'none' });
    });
  });

  it('does not warn when `aria-hidden="true"`', function () {
    doNotExpectWarning(assertions.render.NO_LABEL.msg, function () {
      React.createElement('button', { 'aria-hidden': 'true' });
    });
  });

  it('warns when `aria-hidden="false"`', function () {
    expectWarning(assertions.render.NO_LABEL.msg, function () {
      React.createElement('button', { 'aria-hidden': 'false' });
    });
  });

  it('does not warn if the element is not interactive', function () {
    doNotExpectWarning(assertions.render.NO_LABEL.msg, function () {
      React.createElement('div', null);
    });
  });

  it('does not warn if there is an aria-label', function () {
    doNotExpectWarning(assertions.render.NO_LABEL.msg, function () {
      React.createElement('button', { 'aria-label': 'foo' });
    });
  });

  it('does not warn if there is an aria-labelledby', function () {
    doNotExpectWarning(assertions.render.NO_LABEL.msg, function () {
      React.createElement('button', { 'aria-labelledby': 'foo' });
    });
  });

  it('does not warn if there are text node children', function () {
    doNotExpectWarning(assertions.render.NO_LABEL.msg, function () {
      React.createElement(
        'button',
        null,
        'foo'
      );
    });
  });

  it('does not warn if there are deeply nested text node children', function () {
    doNotExpectWarning(assertions.render.NO_LABEL.msg, function () {
      React.createElement(
        'button',
        null,
        React.createElement(
          'span',
          null,
          React.createElement(
            'span',
            null,
            'foo'
          )
        )
      );
    });
  });

  it('does not error if there are undefined children', function () {
    var undefChild;
    doNotExpectWarning(assertions.render.NO_LABEL.msg, function () {
      React.createElement(
        'button',
        null,
        undefChild,
        ' bar'
      );
    });
  });

  it('does not error if there are null children', function () {
    doNotExpectWarning(assertions.render.NO_LABEL.msg, function () {
      React.createElement(
        'button',
        null,
        'bar ',
        null
      );
    });
  });

  it('does not warn if there is an image with an alt attribute', function () {
    doNotExpectWarning(assertions.render.NO_LABEL.msg, function () {
      React.createElement(
        'button',
        null,
        React.createElement('img', { src: '#', alt: 'Foo' })
      );
    });
  });

  it('warns if an image without alt is the only content', function () {
    expectWarning(assertions.render.NO_LABEL.msg, function () {
      React.createElement(
        'button',
        null,
        React.createElement('img', { src: '#', alt: '' })
      );
    });
  });

  it('does not warn if an image without alt is accompanied by text', function () {
    doNotExpectWarning(assertions.render.NO_LABEL.msg, function () {
      React.createElement(
        'button',
        null,
        'foo ',
        React.createElement('img', { src: '#', alt: '' })
      );
    });
  });

  it('does not warn if a hidden input', function () {
    doNotExpectWarning(assertions.render.NO_LABEL.msg, function () {
      React.createElement('input', { type: 'hidden' });
    });
  });

  it('warns if a visible input', function () {
    expectWarning(assertions.render.NO_LABEL.msg, function () {
      React.createElement('input', { type: 'text' });
    });
  });

  it('warns if an anchor has a tabIndex but no href', function () {
    expectWarning(assertions.render.NO_LABEL.msg, function () {
      React.createElement('a', { tabIndex: '0' });
    });
  });

  it('warns if an anchor has an href', function () {
    expectWarning(assertions.render.NO_LABEL.msg, function () {
      React.createElement('a', { href: '/foo' });
    });
  });

  it('does not warn when the label text is inside a child component', function () {
    var Foo = React.createClass({
      displayName: 'Foo',

      render: function render() {
        return React.createElement(
          'div',
          { className: 'foo' },
          React.createElement(
            'span',
            null,
            React.createElement(
              'span',
              null,
              'foo'
            )
          )
        );
      }
    });

    doNotExpectWarning(assertions.render.NO_LABEL.msg, function () {
      React.render(React.createElement(
        'div',
        { role: 'button' },
        React.createElement(
          'span',
          null,
          React.createElement(Foo, null)
        )
      ), fixture);
    });
  });

  it('does not warn when the label is an image with alt text', function () {
    var Foo = React.createClass({
      displayName: 'Foo',

      render: function render() {
        return React.createElement('img', { alt: 'foo' });
      }
    });

    doNotExpectWarning(assertions.render.NO_LABEL.msg, function () {
      React.render(React.createElement(
        'div',
        { role: 'button' },
        React.createElement(Foo, null)
      ), fixture);
    });
  });

  it('warns when the label is an image without alt text', function () {
    var Foo = React.createClass({
      displayName: 'Foo',

      render: function render() {
        return React.createElement('img', { alt: '' });
      }
    });

    expectWarning(assertions.render.NO_LABEL.msg, function () {
      React.render(React.createElement(
        'div',
        { role: 'button' },
        React.createElement(Foo, null)
      ), fixture);
    });
  });

  it('does not warn when the label is an image with alt text nested inside a child component', function () {
    var Foo = React.createClass({
      displayName: 'Foo',

      render: function render() {
        return React.createElement(
          'div',
          { className: 'foo' },
          React.createElement(
            'span',
            null,
            React.createElement(
              'span',
              null,
              React.createElement('img', { alt: 'foo' })
            )
          )
        );
      }
    });

    doNotExpectWarning(assertions.render.NO_LABEL.msg, function () {
      React.render(React.createElement(
        'div',
        { role: 'button' },
        React.createElement(
          'span',
          null,
          React.createElement(Foo, null)
        )
      ), fixture);
    });
  });

  it('warns when an image without alt text is nested inside a child component', function () {
    var Foo = React.createClass({
      displayName: 'Foo',

      render: function render() {
        return React.createElement(
          'div',
          { className: 'foo' },
          React.createElement(
            'span',
            null,
            React.createElement(
              'span',
              null,
              React.createElement('img', null)
            )
          )
        );
      }
    });

    expectWarning(assertions.render.NO_LABEL.msg, function () {
      React.render(React.createElement(
        'div',
        { role: 'button' },
        React.createElement(
          'span',
          null,
          React.createElement(Foo, null)
        )
      ), fixture);
    });
  });

  it('does not warn when there is an image without alt text with a sibling text node', function () {
    var Foo = React.createClass({
      displayName: 'Foo',

      render: function render() {
        return React.createElement(
          'div',
          { className: 'foo' },
          React.createElement(
            'span',
            null,
            React.createElement(
              'span',
              null,
              'Foo ',
              React.createElement('img', null)
            )
          )
        );
      }
    });

    doNotExpectWarning(assertions.render.NO_LABEL.msg, function () {
      React.render(React.createElement(
        'div',
        { role: 'button' },
        React.createElement(
          'span',
          null,
          React.createElement(Foo, null)
        )
      ), fixture);
    });
  });

  it('warns when a child is a component without text content', function () {
    var Bar = React.createClass({
      displayName: 'Bar',

      render: function render() {
        return React.createElement('div', { className: 'bar' });
      }
    });

    expectWarning(assertions.render.NO_LABEL.msg, function () {
      React.render(React.createElement(
        'div',
        { role: 'button' },
        React.createElement(Bar, null)
      ), fixture);
    });
  });

  it('does not warn as long as one child component has label text', function () {
    var Bar = React.createClass({
      displayName: 'Bar',

      render: function render() {
        return React.createElement('div', { className: 'bar' });
      }
    });

    var Foo = React.createClass({
      displayName: 'Foo',

      render: function render() {
        return React.createElement(
          'div',
          { className: 'foo' },
          React.createElement(
            'span',
            null,
            React.createElement(
              'span',
              null,
              'foo'
            )
          )
        );
      }
    });

    doNotExpectWarning(assertions.render.NO_LABEL.msg, function () {
      React.render(React.createElement(
        'div',
        { role: 'button' },
        React.createElement(Bar, null),
        React.createElement(Foo, null)
      ), fixture);
    });
  });

  it('warns if no child components have label text', function () {
    var Bar = React.createClass({
      displayName: 'Bar',

      render: function render() {
        return React.createElement('div', { className: 'bar' });
      }
    });

    var Foo = React.createClass({
      displayName: 'Foo',

      render: function render() {
        return React.createElement('div', { className: 'foo' });
      }
    });

    expectWarning(assertions.render.NO_LABEL.msg, function () {
      React.render(React.createElement(
        'div',
        { role: 'button' },
        React.createElement(Bar, null),
        React.createElement('div', null),
        React.createElement(Foo, null)
      ), fixture);
    });
  });

  it('does not error when the component has a componentDidMount callback', function () {
    var Bar = React.createClass({
      displayName: 'Bar',

      _privateProp: 'bar',

      componentDidMount: function componentDidMount() {
        return this._privateProp;
      },
      render: function render() {
        return React.createElement('div', { className: 'bar' });
      }
    });

    expectWarning(assertions.render.NO_LABEL.msg, function () {
      React.render(React.createElement(
        'div',
        { role: 'button' },
        React.createElement(Bar, null)
      ), fixture);
    });
  });

  it('does not warn when the label is a number', function () {
    doNotExpectWarning(assertions.render.NO_LABEL.msg, function () {
      React.createElement(
        'a',
        null,
        1111
      );
    });
  });
});

describe('includeSrcNode is "asString"', function () {
  var createElement = React.createElement;
  var fixture;

  before(function () {
    a11y(React, { includeSrcNode: "asString" });
    fixture = document.createElement('div');
    fixture.id = 'fixture-1';
    document.body.appendChild(fixture);
  });

  after(function () {
    React.createElement = createElement;
    fixture = document.getElementById('fixture-1');
    if (fixture) document.body.removeChild(fixture);
  });

  it('returns the outerHTML as a string in the error message', function () {
    var Bar = React.createClass({
      displayName: 'Bar',

      _privateProp: 'bar',

      componentDidMount: function componentDidMount() {
        return this._privateProp;
      },
      render: function render() {
        return React.createElement('div', { role: 'button' });
      }
    });

    var msgs = captureWarnings(function () {
      React.render(React.createElement(Bar, null), fixture);
    });
    var regex = /^Source Node: <(\w+) .+>.*<\/\1>/;
    var matches = msgs[assertions.render.NO_LABEL.msg].match(regex);
    assert.equal(matches[1], "div");
  });
});

describe('filterFn', function () {
  var createElement = React.createElement;

  before(function () {
    var barOnly = function barOnly(name, id, msg) {
      return id === "bar";
    };

    a11y(React, { filterFn: barOnly });
  });

  after(function () {
    React.createElement = createElement;
  });

  describe('when the source element has been filtered out', function () {
    it('does not warn', function () {
      doNotExpectWarning(assertions.tags.img.MISSING_ALT.msg, function () {
        React.createElement('img', { id: 'foo', src: 'foo.jpg' });
      });
    });
  });

  describe('when there are filtered results', function () {
    it('warns', function () {
      expectWarning(assertions.tags.img.MISSING_ALT.msg, function () {
        React.createElement(
          'div',
          null,
          React.createElement('img', { id: 'foo', src: 'foo.jpg' }),
          React.createElement('img', { id: 'bar', src: 'foo.jpg' })
        );
      });
    });
  });
});

describe('device is set to mobile', function () {
  var createElement = React.createElement;

  before(function () {
    a11y(React, { device: ['mobile'] });
  });

  after(function () {
    React.createElement = createElement;
  });

  describe('when role="button"', function () {
    it('does not require onKeyDown', function () {
      doNotExpectWarning(assertions.props.onClick.BUTTON_ROLE_SPACE.msg, function () {
        React.createElement('span', { onClick: k, role: 'button' });
      });
    });

    it('does not require onKeyDown', function () {
      doNotExpectWarning(assertions.props.onClick.BUTTON_ROLE_ENTER.msg, function () {
        React.createElement('span', { onClick: k, role: 'button' });
      });
    });
  });
});

describe('exclusions', function () {
  var createElement = React.createElement;

  before(function () {
    a11y(React, { exclude: ['REDUNDANT_ALT'] });
  });

  after(function () {
    React.createElement = createElement;
  });

  describe('when REDUNDANT_ALT is excluded', function () {
    it('does not warn when the word "image" in the alt attribute', function () {
      doNotExpectWarning(assertions.tags.img.REDUNDANT_ALT.msg, function () {
        React.createElement('img', { src: 'cat.gif', alt: 'image of a cat' });
      });
    });
  });
});

describe('warningPrefix', function () {
  var createElement = React.createElement;

  var warningPrefix = 'react-a11y ERROR:';
  before(function () {
    a11y(React, { warningPrefix: warningPrefix });
  });

  after(function () {
    React.createElement = createElement;
  });

  it('adds the prefix to each warning message', function () {
    expectWarning(warningPrefix + assertions.tags.img.MISSING_ALT.msg, function () {
      React.createElement(
        'div',
        null,
        React.createElement('img', { id: 'foo', src: 'foo.jpg' }),
        React.createElement('img', { id: 'bar', src: 'foo.jpg' })
      );
    });
  });
});

describe('testing children', function () {
  var createElement = React.createElement;

  before(function () {
    a11y(React, { exclude: ['REDUNDANT_ALT'] });
  });

  after(function () {
    React.createElement = createElement;
  });

  describe('when children is passed down in props', function () {
    it('calls each test with the children', function () {
      doNotExpectWarning(assertions.render.NO_LABEL.msg, function () {
        React.createElement('a', { href: 'google.com', children: 'Google' });
      });
    });
  });

  describe('when children is passed down separately from props', function () {
    it('calls each test with the children', function () {
      doNotExpectWarning(assertions.render.NO_LABEL.msg, function () {
        React.createElement('a', { href: 'google.com' }, 'Google');
      });
    });
  });
});