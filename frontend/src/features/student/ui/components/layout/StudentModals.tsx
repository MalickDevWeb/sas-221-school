import React from 'react';
import { SearchModal } from './modals/SearchModal';
import { SettingsModal } from './modals/SettingsModal';
import { SupportModal } from './modals/SupportModal';
import { DocModal } from './modals/DocModal';
import { LegalModal } from './modals/LegalModal';
import { CalendarModal } from './modals/CalendarModal';

interface StudentModalsProps {
  state: any;
}

export function StudentModals({ state }: StudentModalsProps) {
  return (
    <>
      <SearchModal
        showSearch={state.showSearch} setShowSearch={state.setShowSearch}
        searchQuery={state.searchQuery} setSearchQuery={state.setSearchQuery}
        filteredSearchItems={state.filteredSearchItems}
        onSearchAction={(item) => {
          state.setShowSearch(false); state.setSearchQuery('');
          if (item.path) { state.navigate(item.path); state.triggerLayoutToast(`Navigation vers : ${item.name}`); }
          else if (item.action === 'ai_tutor') state.handleAiTutor();
          else if (item.action === 'support') state.setShowSupportModal(true);
          else if (item.action === 'docs') state.setShowDocModal(true);
        }}
      />
      <SettingsModal
        showSettings={state.showSettings} setShowSettings={state.setShowSettings}
        settingsPrefs={state.settingsPrefs} setSettingsPrefs={state.setSettingsPrefs}
        triggerToast={state.triggerLayoutToast}
      />
      <SupportModal
        showSupportModal={state.showSupportModal} setShowSupportModal={state.setShowSupportModal}
        ticketCategory={state.ticketCategory} setTicketCategory={state.setTicketCategory}
        ticketSubject={state.ticketSubject} setTicketSubject={state.setTicketSubject}
        ticketDescription={state.ticketDescription} setTicketDescription={state.setTicketDescription}
        isSendingTicket={state.isSendingTicket}
        onSendTicket={state.handleSendTicket}
      />
      <DocModal
        showDocModal={state.showDocModal} setShowDocModal={state.setShowDocModal}
        openDocSection={state.openDocSection} setOpenDocSection={state.setOpenDocSection}
      />
      <LegalModal
        showLegalModal={state.showLegalModal} setShowLegalModal={state.setShowLegalModal}
      />
      <CalendarModal
        showCalendar={state.showCalendar}
        setShowCalendar={state.setShowCalendar}
      />
    </>
  );
}
