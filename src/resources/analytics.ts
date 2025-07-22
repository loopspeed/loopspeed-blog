
export enum EventName {
  ClickGoToLoopspeed = 'click_go_to_loopspeed',
  ClickMeetLoopspeed = 'click_meet_loopspeed',
  ClickReadMore = 'click_read_more',
  ClickLinkedin = 'click_linkedin',
}

export enum ConversionEventName {

}

export type BaseEventProperties = {
  event: EventName | ConversionEventName
}

export type CustomEventProperties = {
  event_name?: EventName
  blog_post?: string
}
