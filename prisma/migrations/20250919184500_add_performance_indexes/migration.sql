-- CreateIndex
CREATE INDEX "Artist_name_idx" ON "public"."Artist"("name");

-- CreateIndex
CREATE INDEX "Artist_genre_idx" ON "public"."Artist"("genre");

-- CreateIndex
CREATE INDEX "Event_title_idx" ON "public"."Event"("title");

-- CreateIndex
CREATE INDEX "Event_startsAt_idx" ON "public"."Event"("startsAt");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "public"."Event"("status");

-- CreateIndex
CREATE INDEX "Event_venueId_idx" ON "public"."Event"("venueId");

-- CreateIndex
CREATE INDEX "Event_artistId_idx" ON "public"."Event"("artistId");

-- CreateIndex
CREATE INDEX "Event_startsAt_status_idx" ON "public"."Event"("startsAt", "status");

-- CreateIndex
CREATE INDEX "Ticket_eventId_idx" ON "public"."Ticket"("eventId");

-- CreateIndex
CREATE INDEX "Ticket_userId_idx" ON "public"."Ticket"("userId");

-- CreateIndex
CREATE INDEX "Ticket_status_idx" ON "public"."Ticket"("status");

-- CreateIndex
CREATE INDEX "Ticket_eventId_status_idx" ON "public"."Ticket"("eventId", "status");

-- CreateIndex
CREATE INDEX "Venue_name_idx" ON "public"."Venue"("name");

-- CreateIndex
CREATE INDEX "Venue_city_idx" ON "public"."Venue"("city");

-- CreateIndex
CREATE INDEX "Venue_state_idx" ON "public"."Venue"("state");

-- CreateIndex
CREATE INDEX "Venue_city_state_idx" ON "public"."Venue"("city", "state");
