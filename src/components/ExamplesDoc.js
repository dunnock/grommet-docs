// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import Section from 'grommet/components/Section';
import Header from 'grommet/components/Header';
import Menu from 'grommet/components/Menu';
import Anchor from 'grommet/components/Anchor';
import Button from 'grommet/components/Button';
import CheckBox from 'grommet/components/CheckBox';
import Select from 'grommet/components/Select';
import PreviousIcon from 'grommet/components/icons/base/Previous';
import NextIcon from 'grommet/components/icons/base/Next';
import LinkPreviousIcon from 'grommet/components/icons/base/LinkPrevious';
import KeyboardAccelerators from 'grommet/utils/KeyboardAccelerators';
import DocsArticle from './DocsArticle';

export default class ExamplesDoc extends Component {

  constructor () {
    super();
    this._onNext = this._onNext.bind(this);
    this._onPrevious = this._onPrevious.bind(this);
    this._onChangePropertyValue = this._onChangePropertyValue.bind(this);
    this._onTogglePropertyValue = this._onTogglePropertyValue.bind(this);
    this.state = {
      index: 0, background: 'no background', propertyValue: undefined
    };
  }

  componentDidMount () {
    this._keys = {left: this._onPrevious, right: this._onNext};
    KeyboardAccelerators.startListeningToKeyboard(this, this._keys);
    // load index from location
    const index = parseInt(window.location.hash.slice(1), 10);
    this.setState({ index: index || 0 });
  }

  componentWillUnmount () {
    KeyboardAccelerators.stopListeningToKeyboard(this, this._keys);
  }

  _select (index) {
    this.setState({ index: index });
    window.location.hash = index;
  }

  _onNext () {
    const { examples } = this.props;
    const { index } = this.state;
    this._select((index < (examples.length - 1) ? index + 1 :
      (examples.length - 1)));
  }

  _onPrevious () {
    const { index } = this.state;
    this._select((index > 0 ? index - 1 : 0));
  }

  _onChangePropertyValue (event) {
    this.setState({ propertyValue: event.target.value });
  }

  _onTogglePropertyValue (event) {
    this.setState({ propertyValue: ! this.state.propertyValue });
  }

  render () {
    const { context, examples, property, title } = this.props;
    const { index, background, propertyValue } = this.state;
    const example = examples[index];

    const items = examples.map((item, index) => (
      <Anchor key={index} label={item.label} href='#'
        onClick={(event) => {
          event.preventDefault();
          this._select(index);
        }} />
    ));

    let propertySelector;
    let props = {};
    if (property) {
      if (property.values) {
        const options = property.values.map(value => (
          <option key={value}>{value}</option>
        ));
        options.unshift(<option key="NoNe" />);
        propertySelector = (
          <select value={propertyValue} onChange={this._onChangePropertyValue} >
            {options}
          </select>
        );
      } else {
        propertySelector = (
          <CheckBox checked={propertyValue || false} toggle={true}
            label={property.name}
            onChange={this._onTogglePropertyValue} />
        );
      }
      if (propertyValue) {
        props[property.name] = propertyValue;
      }
    }

    const Component = example.component;
    props = { ...(example.props || {}), ...props };

    let contextSection;
    if (context) {
      const link = React.cloneElement(context,
        { primary: true, icon: <LinkPreviousIcon /> });
      contextSection = (
        <Section pad={{ horizontal: 'large', vertical: 'medium' }}
          align="start">
          {link}
        </Section>
      );
    }

    let previous, next, menu, pad;
    if (items.length > 1) {
      menu = (
        <Menu label={examples[index].label} inline={false} size="large">
          {items}
        </Menu>
      );
      previous = (
        <Button icon={<PreviousIcon />}
          onClick={index > 0 ? this._onPrevious : undefined} />
      );
      next = (
        <Button icon={<NextIcon />}
          onClick={index < (items.length - 1) ? this._onNext : undefined} />
      );
    } else {
      pad = { horizontal: 'large' };
    }

    let content = <Component {...props} />;
    if ('light on dark' === background) {
      content = (
        <Section flex={true} pad="medium" colorIndex="light-1">
          {content}
        </Section>
      );
    }

    return (
      <DocsArticle context={context} title={title} colorIndex="neutral-3"
        full={true}>
        <Header justify="between" colorIndex="light-2"
          pad={{ horizontal: 'large' }}>
          {menu}
          {propertySelector}
          <Select value={background}
            options={['no background', 'dark', 'light on dark']}
            onChange={event => this.setState({ background: event.option })} />
        </Header>

        <Section appCentered={false} justify="between" align="start"
          direction="row" pad={pad}
          colorIndex={'no background' !== background ? 'grey-2' : undefined}>
          {previous}
          {content}
          {next}
        </Section>

        {contextSection}

      </DocsArticle>
    );
  }
};

ExamplesDoc.propTypes = {
  context: PropTypes.element,
  examples: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    component: PropTypes.func,
    props: PropTypes.object
  })),
  property: PropTypes.shape({
    name: PropTypes.string.isRequired,
    values: PropTypes.arrayOf(PropTypes.string)
  }),
  title: PropTypes.string
};
