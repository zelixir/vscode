/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Code Slim: bridge file for registrations that had to survive the removal of the AI/chat/debug/
// notebook/testing/tasks/mcp/voice/editSessions/userDataSync UI contributions from the workbench
// entry files (workbench.common.main.ts / workbench.desktop.main.ts must stay free of those
// imports), while retained features still constructor-inject the services below.
//
// Removed UI contributions (no longer imported anywhere):
//   contrib/chat/browser/chat.contribution.js            (chat commands + response file service)
//   contrib/chat/browser/agentSessions/agentHost/agentHost.contribution.js (agent sessions views)
//   contrib/chat/browser/chat.view.contribution.js       (agent plugins view)
//   contrib/inlineChat/browser/inlineChat.contribution.js
//   contrib/agentsVoice/browser/agentsVoice.contribution.js
//   contrib/mcp/browser/mcp.contribution.js + mcp.view.contribution.js
//   contrib/chat/browser/chatSessions/chatSessions.contribution.js
//   contrib/chat/browser/contextContrib/chatContext.contribution.js
//   contrib/notebook/browser/notebook.contribution.js
//   contrib/debug/browser/* + contrib/debug/electron-browser/extensionHostDebugService.js*
//   contrib/testing/browser/testing.contribution.js
//   contrib/tasks/browser/task.contribution.js + electron-browser/taskService.js
//   contrib/interactive/browser/interactive.contribution.js
//   contrib/replNotebook/browser/repl.contribution.js
//   contrib/emmet/browser/emmet.contribution.js
//   contrib/remote/*, contrib/remoteTunnel/*, contrib/remoteCodingAgents/*
//   contrib/userDataSync/*, contrib/editSessions/*
//   contrib/welcomeAgentSessions/*
//   (* electron debug service registration moved to extensions electron-browser contribution)
//
// Compromise (degradation principle): contrib/chat/browser/chat.shared.contribution.js is KEPT
// because many retained features constructor-inject chat services (quick access "attach to chat",
// scm quick diff, markers/search context, terminal decorations, extensions language-model tools,
// browserView agent tools, editor dictation). It registers the chat services + editor pane but no
// chat view/panel; a slimmer split is possible follow-up work.

import './services/userDataSync/common/userDataSyncUtil.js';
import './services/userDataSync/browser/userDataSyncWorkbenchService.js';
import './contrib/chat/browser/chat.shared.contribution.js';

import { InstantiationType, registerSingleton } from '../platform/instantiation/common/extensions.js';
import { IgnoredExtensionsManagementService, IIgnoredExtensionsManagementService } from '../platform/userDataSync/common/ignoredExtensions.js';
import { INotebookService } from './contrib/notebook/common/notebookService.js';
import { NotebookService } from './contrib/notebook/browser/services/notebookServiceImpl.js';
import { INotebookEditorModelResolverService } from './contrib/notebook/common/notebookEditorModelResolverService.js';
import { NotebookModelResolverServiceImpl } from './contrib/notebook/common/notebookEditorModelResolverServiceImpl.js';
import { INotebookEditorService } from './contrib/notebook/browser/services/notebookEditorService.js';
import { NotebookEditorWidgetService } from './contrib/notebook/browser/services/notebookEditorServiceImpl.js';
import { Event } from '../base/common/event.js';
import { IOnboardingService } from './contrib/welcomeOnboarding/common/onboardingService.js';

registerSingleton(IIgnoredExtensionsManagementService, IgnoredExtensionsManagementService, InstantiationType.Delayed);

// Code Slim: the notebook UI contribution was removed, but retained features constructor-inject
// notebook services (search view / search model / search results: INotebookService,
// INotebookEditorService; search replace + bulk edit: INotebookEditorModelResolverService),
// so keep the headless notebook services registered.
registerSingleton(INotebookService, NotebookService, InstantiationType.Delayed);
registerSingleton(INotebookEditorService, NotebookEditorWidgetService, InstantiationType.Delayed);
registerSingleton(INotebookEditorModelResolverService, NotebookModelResolverServiceImpl, InstantiationType.Delayed);

// Code Slim: the chat-driven welcome onboarding wizard was removed with the chat contribs
// (its OnboardingVariationA hard-fails at module load without product.defaultChatAgent),
// but startupPage constructor-injects IOnboardingService, so keep a headless registration:
// show() is a no-op and onDidDismiss never fires.
class HeadlessOnboardingService implements IOnboardingService {
	readonly _serviceBrand: undefined;
	readonly onDidDismiss: Event<void> = Event.None;
	show(): void { /* Code Slim: onboarding wizard removed */ }
}
registerSingleton(IOnboardingService, HeadlessOnboardingService, InstantiationType.Delayed);
