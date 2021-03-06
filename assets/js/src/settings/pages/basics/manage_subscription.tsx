import React from 'react';
import { t } from 'common/functions';
import { useSetting } from 'settings/store/hooks';
import {
  Label, Inputs, SegmentsSelect, PagesSelect,
} from 'settings/components';

export default function ManageSubscription() {
  const [page, setPage] = useSetting('subscription', 'pages', 'manage');
  const [segments, setSegments] = useSetting('subscription', 'segments');
  return (
    <>
      <Label
        title={t('manageSubTitle')}
        description={(
          <>
            {t('manageSubDescription1')}
            <br />
            {t('manageSubDescription2')}
          </>
        )}
        htmlFor="subscription-manage-page"
      />
      <Inputs>
        <PagesSelect
          value={page}
          preview="manage"
          setValue={setPage}
          id="subscription-manage-page"
          automationId="subscription-manage-page-selection"
          linkAutomationId="preview_manage_subscription_page_link"
        />
        <br />
        <label htmlFor="subscription-segments">{t('subscribersCanChooseFrom')}</label>
        <br />
        <SegmentsSelect
          id="subscription-segments"
          value={segments}
          setValue={setSegments}
          placeholder={t('leaveEmptyToDisplayAll')}
        />
      </Inputs>
    </>
  );
}
