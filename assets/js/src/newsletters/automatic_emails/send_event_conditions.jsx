import React from 'react';
import Selection from 'form/fields/selection.jsx';
import EventScheduling from 'newsletters/automatic_emails/events/event_scheduling.jsx';
import EventOptions from 'newsletters/automatic_emails/events/event_options.jsx';
import _ from 'underscore';
import PropTypes from 'prop-types';

const defaultAfterTimeType = 'immediate';
const defaultAfterTimeNumber = 1;

class SendEventConditions extends React.Component {
  constructor(props) {
    super(props);
    const { field } = props;
    this.handleChange = this.handleChange.bind(this);
    this.email = field.email;
    this.emailOptions = field.emailOptions;
    this.events = _.indexBy(this.email.events, 'slug');
    this.segments = _.filter(window.mailpoet_segments, (segment) => segment.deleted_at === null);

    const event = this.events[this.emailOptions.event];
    const afterTimeType = this.emailOptions.afterTimeType
      || event.defaultAfterTimeType
      || defaultAfterTimeType;

    this.state = {
      event,
      afterTimeType,
      eventSlug: this.emailOptions.event,
      eventOptionValue: null,
      afterTimeNumber: this.emailOptions.afterTimeNumber || defaultAfterTimeNumber,
      segment: (this.emailOptions.segment) ? this.emailOptions.segment : null,
    };
  }

  displayHeader() {
    const { event } = this.state;
    return event.title;
  }

  displayEventOptions() {
    const { event, eventSlug } = this.state;
    const meta = this.emailOptions.meta || {};
    const props = {
      emailSlug: this.email.slug,
      eventSlug,
      onValueChange: this.handleChange,
      eventOptions: event.options || null,
    };

    if (meta.option) {
      // if event uses remote filter to populate options, use the saved meta options
      // to build the initial select list
      if (props.eventOptions.type === 'remote') {
        props.eventOptions.values = meta.option;
      }
      // pre-select values
      props.selected = _.map(meta.option, (data) => data.id);
    }

    return (
      <EventOptions {...props} />
    );
  }

  displaySegments() {
    const { segment } = this.state;
    if (this.emailOptions.sendTo === 'user') return null;

    const props = {
      field: {
        id: 'segments',
        forceSelect2: true,
        values: this.segments,
        extendSelect2Options: {
          minimumResultsForSearch: Infinity,
        },
        selected: () => segment,
      },
      onValueChange: (e) => this.handleChange({ segment: e.target.value }),
    };

    return (
      <div className="event-segment-selection">
        <Selection {...props} />
      </div>
    );
  }

  displayScheduling() {
    const { afterTimeNumber, afterTimeType, event } = this.state;
    const props = {
      item: {
        afterTimeNumber,
        afterTimeType,
      },
      event,
      onValueChange: this.handleChange,
    };

    return (
      <EventScheduling {...props} />
    );
  }

  handleChange(data) {
    const { afterTimeNumber } = this.state;
    const newState = data;

    if (newState.afterTimeType && newState.afterTimeType === 'immediate') {
      newState.afterTimeNumber = null;
    } else if (newState.afterTimeType && !newState.afterTimeNumber && !afterTimeNumber) {
      newState.afterTimeNumber = defaultAfterTimeNumber;
    }

    this.setState(data, this.propagateChange);
  }

  propagateChange() {
    const {
      eventSlug, afterTimeType, afterTimeNumber, segment, eventOptionValue,
    } = this.state;
    const { onValueChange } = this.props;
    if (!onValueChange) return;

    const options = {
      group: this.email.slug,
      event: eventSlug,
      afterTimeType,
    };

    if (afterTimeNumber) options.afterTimeNumber = afterTimeNumber;
    if (segment) options.segment = segment;
    if (eventOptionValue) options.meta = { option: eventOptionValue };

    onValueChange({
      target: {
        name: 'options',
        value: options,
      },
    });
  }

  render() {
    return (
      <div>
        <div className="events-conditions-header">{this.displayHeader()}</div>
        <div className="events-conditions-container">
          <div>{this.displayEventOptions()}</div>
          <div>{this.displaySegments()}</div>
          <div>{this.displayScheduling()}</div>
        </div>
      </div>
    );
  }
}

SendEventConditions.propTypes = {
  field: PropTypes.shape({
    email: PropTypes.shape({
      events: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    }).isRequired,
    emailOptions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  }).isRequired,
  onValueChange: PropTypes.func,
};

SendEventConditions.defaultProps = {
  onValueChange: null,
};

export default SendEventConditions;
