// Template configurations
export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  siteData: any;
}

export const templates: Template[] = [
  {
    id: 'hackathon',
    name: 'Hackathon',
    description: 'Perfect landing page for hackathons and tech events',
    thumbnail: '/templates/hackathon-thumb.jpg',
    siteData: {
      "siteName": "Hackathon Template",
      "subdomain": "hackathon-template",
      "pages": [
        {
          "name": "Home",
          "slug": "/",
          "sections": [
            {
              "id": "hero-section",
              "type": "hero",
              "title": "Join Our Amazing Hackathon",
              "subtitle": "Build innovative solutions in 48 hours",
              "backgroundImage": "",
              "backgroundColor": "#3b82f6",
              "textColor": "#ffffff",
              "alignment": "center",
              "height": "large",
              "components": [
                {
                  "id": "hero-button-1",
                  "type": "button",
                  "props": {
                    "text": "Register Now",
                    "variant": "primary",
                    "size": "large",
                    "link": "#register"
                  }
                }
              ]
            },
            {
              "id": "about-section",
              "type": "content",
              "title": "About the Event",
              "backgroundColor": "#ffffff",
              "textColor": "#1e293b",
              "components": [
                {
                  "id": "about-text",
                  "type": "text",
                  "props": {
                    "text": "Join developers, designers, and innovators from around the world for an incredible weekend of coding, collaboration, and creativity. Build amazing projects, learn new skills, and compete for exciting prizes!",
                    "size": "text",
                    "align": "center"
                  }
                }
              ]
            },
            {
              "id": "features-section",
              "type": "content",
              "title": "Event Highlights",
              "backgroundColor": "#f8fafc",
              "components": [
                {
                  "id": "feature-1",
                  "type": "heading",
                  "props": {
                    "heading": "🎯 Amazing Prizes",
                    "subheading": "Win cash prizes, tech gadgets, and exclusive opportunities",
                    "align": "center"
                  }
                },
                {
                  "id": "feature-2",
                  "type": "heading",
                  "props": {
                    "heading": "🚀 Learn & Network",
                    "subheading": "Workshops, mentorship sessions, and networking opportunities",
                    "align": "center"
                  }
                },
                {
                  "id": "feature-3",
                  "type": "heading",
                  "props": {
                    "heading": "🎪 Fun Activities",
                    "subheading": "Games, food, and entertainment throughout the event",
                    "align": "center"
                  }
                }
              ]
            },
            {
              "id": "cta-section",
              "type": "hero",
              "title": "Ready to Participate?",
              "subtitle": "Register now and be part of something amazing!",
              "backgroundColor": "#8b5cf6",
              "textColor": "#ffffff",
              "alignment": "center",
              "height": "medium",
              "components": [
                {
                  "id": "cta-button",
                  "type": "button",
                  "props": {
                    "text": "Register Now",
                    "variant": "secondary",
                    "size": "large",
                    "link": "#register"
                  }
                }
              ]
            }
          ]
        }
      ],
      "logo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAlgAAAHCCAYAAAAIDJMjAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAAGYktHRAD/AP8A/6C9p5MAAAAJcEhZcwAACxMAAAsTAQCanBgAACAASURBVHja7J15nF1VnZ8f",
      "logoWidth": "120px",
      "themeId": "68ff3c5e1fd5b618e0f2f27b"
    }
  }
];
