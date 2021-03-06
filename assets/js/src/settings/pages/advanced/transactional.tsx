import React from 'react';
import ReactStringReplace from 'react-string-replace';

import { t, onChange } from 'common/functions';
import { Label, Inputs } from 'settings/components';
import { useSetting, useSelector } from 'settings/store/hooks';

export default function Transactional() {
  const [provider] = useSetting('smtp_provider');
  const isMssActive = useSelector('isMssActive')();
  const [enabled, setEnabled] = useSetting('send_transactional_emails');
  let methodLabel;
  if (isMssActive) methodLabel = 'MailPoet Sending Service';
  else if (provider === 'manual') methodLabel = 'SMTP';
  else if (provider === 'SendGrid') methodLabel = 'SendGrid';
  else if (provider === 'AmazonSES') methodLabel = 'Amazon SES';
  else if (provider === 'server') methodLabel = t('hostOption');

  return (
    <>
      <Label
        title={t('transactionalTitle')}
        description={(
          <>
            {t('transactionalDescription')}
            {' '}
            <a
              href="https://kb.mailpoet.com/article/292-choose-how-to-send-your-wordpress-websites-emails"
              data-beacon-article="5ddbf92504286364bc9228c5"
              rel="noopener noreferrer"
              target="_blank"
            >
              {t('transactionalLink')}
            </a>
          </>
        )}
        htmlFor=""
      />
      <Inputs>
        <input
          type="radio"
          id="transactional-enabled"
          value="1"
          checked={enabled === '1'}
          onChange={onChange(setEnabled)}
        />
        <label htmlFor="transactional-enabled">
          {t('transactionalCurrentMethod').replace('%1$s', methodLabel)}
          <br />
          <span className="mailpoet-note">
            {ReactStringReplace(t('transactionalMssNote'),
              /\[link\](.*?)\[\/link\]/,
              (text) => (
                <a
                  key={text}
                  href="https://kb.mailpoet.com/article/292-choose-how-to-send-your-wordpress-websites-emails#attachments"
                  rel="noopener noreferrer"
                  data-beacon-article="5ddbf92504286364bc9228c5"
                  target="_blank"
                >
                  {text}
                </a>
              ))}
          </span>
        </label>
        <br />
        <input
          type="radio"
          id="transactional-disabled"
          value=""
          checked={enabled === ''}
          onChange={onChange(setEnabled)}
        />
        <label htmlFor="transactional-disabled">
          {t('transactionalWP')}
        </label>
      </Inputs>
    </>
  );
}
