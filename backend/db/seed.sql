-- Seed data for The Daily Aesthetic

-- Insert sample projects
INSERT INTO projects (title, date, image_url, excerpt, description, tags) VALUES
('The Brutalist Revival in Tokyo', 'December 2024', 'https://picsum.photos/seed/tokyo1/800/1000',
 'A comprehensive exploration into the depths of modern architecture and the silence it brings to the chaotic urban environment.',
 'This project represents a paradigm shift in how we perceive empty space. By utilizing raw concrete textures and contrasting them with soft, natural light, the architect creates a sanctuary within the bustling city. The structure itself becomes a canvas for the shadows of passing time.<br><br>The interior follows a strict monochromatic palette, ensuring that the inhabitants become the primary source of color and life within the dwelling. It is not merely a house; it is a statement on restraint.',
 ARRAY['Architecture', 'Interior', 'Residential']),

('The Concrete Silence', 'November 2024', 'https://picsum.photos/seed/concrete1/800/1000',
 'An exploration of how architectural voids create meaningful spaces in contemporary design.',
 'In this residence, silence is not the absence of sound but the presence of intentional space. Each room flows into the next through carefully considered thresholds that frame light and shadow. The concrete walls, left raw and unfinished, tell the story of their own creation.<br><br>The minimalist approach extends beyond aesthetics into the realm of experience, where every surface, every angle, contributes to a meditative quality that transforms the act of living into something more profound.',
 ARRAY['Architecture', 'Residential', 'Concrete']),

('Form Follows Fiction', 'October 2024', 'https://picsum.photos/seed/form1/800/1000',
 'A narrative-driven approach to spatial design where each room tells its own story.',
 'This project challenges the Bauhaus mantra by proposing that form should follow fiction. Each space within this gallery was designed around a fictional narrative, creating rooms that exist as both functional spaces and artistic installations.<br><br>Visitors navigate through chapters rather than galleries, experiencing a curated journey that blurs the line between architecture and storytelling.',
 ARRAY['Architecture', 'Gallery', 'Experimental']),

('Urban Solitude', 'September 2024', 'https://picsum.photos/seed/urban1/800/1000',
 'A meditation pavilion in the heart of Seoul that creates private moments in public space.',
 'Designed as an antidote to urban chaos, this small pavilion uses strategic placement and material transparency to create moments of solitude without isolation. Glass and steel framework supports translucent panels that diffuse the cityscape into abstract patterns of light and color.<br><br>The structure invites passersby to pause, offering a contemplative space that remains connected to the urban pulse while providing psychological distance.',
 ARRAY['Architecture', 'Public', 'Pavilion']),

('Minimalist Echoes', 'August 2024', 'https://picsum.photos/seed/echo1/800/1000',
 'An acoustic chapel where architectural form amplifies the power of silence.',
 'This chapel explores the relationship between sound and space through minimal means. The curved concrete walls create specific acoustic properties that transform even the smallest sound into a resonant event.<br><br>Natural light enters only from above, creating a vertical axis that draws the eye and mind upward. The space demonstrates how reduction in material complexity can lead to amplification in experiential intensity.',
 ARRAY['Architecture', 'Religious', 'Acoustic']),

('The White Space Theory', 'July 2024', 'https://picsum.photos/seed/white1/800/1000',
 'A design studio that uses negative space as its primary design element.',
 'In this workspace, emptiness is treated as a material rather than an absence. Large voids between functional areas create visual and psychological breathing room, allowing ideas to emerge from the spaciousness itself.<br><br>The all-white palette serves not as a style choice but as a strategy to eliminate visual noise, creating a neutral ground where creativity can flourish without predetermined direction.',
 ARRAY['Architecture', 'Commercial', 'Workspace']);

-- Insert sample articles
INSERT INTO articles (title, author, date, content, image_url) VALUES
('Why We Return to Analog', 'Elena Fischer', 'January 15, 2024',
 '<p class="first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-[-4px]">In an age where digital tools promise infinite possibility, designers are increasingly returning to analog methods—not out of nostalgia, but out of necessity. The tactile feedback of pencil on paper, the permanence of ink, the limitation of physical materials: these constraints do not hinder creativity but channel it.</p><p class="mt-4">Digital design offers undo buttons and infinite iterations, yet this very freedom can paralyze. Analog processes force commitment. Each mark carries weight. Each decision matters. This is not about rejecting technology but about understanding when its absence serves us better.</p><p class="mt-4">The renaissance of film photography, the resurgence of letterpress, the renewed interest in hand-drawn typography—these are not retreats but advances. They represent a mature relationship with technology, one that chooses tools intentionally rather than defaulting to digital by habit.</p>',
 'https://picsum.photos/seed/analog1/800/400'),

('The Death of Color', 'Marcus Thorne', 'January 8, 2024',
 '<p class="first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-[-4px]">Walk through any design conference, scroll through any portfolio site, browse any architecture magazine, and you will notice a trend: the world is turning gray. Not metaphorically, but literally. The vibrant palettes of postmodernism have given way to monochrome restraint.</p><p class="mt-4">This is not mere fashion. It represents a philosophical shift in how we approach visual communication. Color, with all its cultural baggage and emotional triggers, has become too loud for our overstimulated age. Designers are choosing silence.</p><p class="mt-4">Yet one must ask: in eliminating color, what else do we eliminate? Does the pursuit of timeless design create spaces devoid of time itself? These are questions worth considering before we paint everything white.</p>',
 'https://picsum.photos/seed/color1/800/400'),

('Typography as Voice', 'Sarah Jenkins', 'January 1, 2024',
 '<p class="first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-[-4px]">Every typeface carries a voice. Helvetica whispers neutral efficiency. Garamond speaks with classical authority. Comic Sans screams unprofessionalism (despite its functional merits for dyslexic readers). Understanding typography means learning to hear these voices.</p><p class="mt-4">The current trend toward grotesque sans-serifs reflects our cultural moment: a desire for clarity without ornament, communication without personality. But personality is not decoration—it is meaning itself. A message delivered in Times New Roman says something different than the same words set in Futura, even if the words remain identical.</p><p class="mt-4">As designers, we must ask ourselves: are we choosing typefaces that amplify our message or ones that remain safely invisible? Both approaches have merit, but the choice should be intentional, not default.</p>',
 'https://picsum.photos/seed/typo1/800/400'),

('Designing for Eternity', 'David Okonma', 'December 25, 2023',
 '<p class="first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-[-4px]">Trend-driven design has a short shelf life. Six months after the latest visual style dominates, it already looks dated. This creates a treadmill where designers must constantly refresh to remain relevant, a exhausting and ultimately hollow pursuit.</p><p class="mt-4">The alternative is designing for eternity—or at least for decades. This requires looking beyond current aesthetics to fundamental principles: proportion, balance, clarity, purpose. These qualities do not age because they are not tied to a particular moment.</p><p class="mt-4">Consider the designs that have endured: the Swiss grid system, Dieter Rams products, the New York subway map. They work not because they were fashionable but because they solved problems elegantly. Fashion changes. Problems remain. Design for the problems.</p>',
 'https://picsum.photos/seed/eternity1/800/400');

-- Insert sample products
INSERT INTO products (title, price, date, image_url, description, tags) VALUES
('Ceramic Vase No. 4', 45.00, 'In Stock', 'https://picsum.photos/seed/vase1/800/800',
 'Handcrafted ceramic vessel with a matte white glaze. Each piece is unique, thrown on the wheel by artisan potters in Kyoto. The subtle irregularities celebrate the human hand in an age of machine precision. Designed to hold a single stem or stand alone as sculptural form.',
 ARRAY['Object', 'Ceramic', 'Living']),

('Linen Planner', 68.00, 'In Stock', 'https://picsum.photos/seed/planner1/800/800',
 'Undated yearly planner bound in natural linen with brass hardware. Features heavyweight, fountain-pen-friendly paper and a minimal layout that provides structure without constraint. Made in partnership with a family-run bindery in Florence that has operated since 1856.',
 ARRAY['Stationery', 'Office', 'Planning']),

('Graphite Pen Set', 32.00, 'In Stock', 'https://picsum.photos/seed/pen1/800/800',
 'Set of three mechanical pencils in matte black aluminum. 0.3mm, 0.5mm, and 0.7mm lead sizes. Balanced weight distribution for extended use. The precision mechanism was developed for technical drafting but refined for everyday writing. Includes leather carrying case.',
 ARRAY['Stationery', 'Office', 'Writing']),

('Oak Desk Organizer', 120.00, 'In Stock', 'https://picsum.photos/seed/organizer1/800/800',
 'Solid white oak organizer with dedicated compartments for pens, cards, and small objects. Finished with natural oil that deepens with age. The geometric arrangement creates order while maintaining visual calm. Each piece is milled from a single board to ensure consistent grain.',
 ARRAY['Object', 'Office', 'Storage']),

('Architectural Print Set', 95.00, 'In Stock', 'https://picsum.photos/seed/print1/800/800',
 'Limited edition set of three archival prints featuring iconic brutalist structures. Printed on museum-grade paper using traditional lithography. Each print is numbered and signed by the artist. The images are reproduced in duotone, emphasizing form over literal representation.',
 ARRAY['Art', 'Print', 'Living']),

('Concrete Bookend Pair', 78.00, 'In Stock', 'https://picsum.photos/seed/bookend1/800/800',
 'Cast concrete bookends with embedded steel plates for weight. The raw concrete surface is sealed but left unpolished, showing the marks of the casting process. Heavy enough to support substantial book collections while maintaining a refined presence.',
 ARRAY['Object', 'Office', 'Living']);
