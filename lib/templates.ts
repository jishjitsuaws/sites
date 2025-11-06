// Template configurations
export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  sections: any[];
}

export const templates: Template[] = [
  {
    id: 'hackathon-codenovate',
    name: 'Hackathon Event (CODENOVATE)',
    description: 'Complete hackathon landing page with prizes, winners, gallery, countdown timer, and more',
    thumbnail: '/templates/hackathon-thumb.jpg',
    sections: [
      {
        id: "section-banner",
        sectionName: "Home",
        showInNavbar: true,
        components: [
          {
            id: "banner-1",
            type: "banner",
            props: {
              heading: null,
              subheading: null,
              backgroundColor: "#415f90",
              textColor: "#bd0000",
              height: "600px",
              backgroundImage: "",
              buttonText: null,
              buttonLink: "#",
              alt: ""
            }
          }
        ],
        layout: {
          direction: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: 16,
          padding: 24,
          backgroundColor: "transparent"
        }
      },
      {
        id: "section-title",
        sectionName: "",
        showInNavbar: false,
        components: [
          {
            id: "heading-1",
            type: "heading",
            props: {
              text: "HACKATHON 2025",
              level: 2,
              align: "center",
              size: "title",
              fontSize: 54,
              fontFamily: "Arial",
              color: "#6366f1"
            }
          }
        ],
        layout: {
          direction: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: 16,
          padding: 24,
          backgroundColor: "transparent"
        }
      },
      {
        id: "section-about",
        sectionName: "About",
        showInNavbar: true,
        components: [
          {
            id: "text-1",
            type: "text",
            props: {
              text: "Join developers, designers, and innovators from around the world for an incredible weekend of coding, collaboration, and creativity. Build amazing projects, learn new skills, and compete for exciting prizes!",
              align: "left",
              size: "text",
              fontSize: 20,
              fontFamily: "Source Sans Pro",
              color: "#3b0764"
            }
          }
        ],
        layout: {
          direction: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: 16,
          padding: 24,
          backgroundColor: "transparent"
        }
      },
      {
        id: "section-prize-heading",
        sectionName: "",
        showInNavbar: false,
        components: [
          {
            id: "heading-prize",
            type: "heading",
            props: {
              text: "Opportunity to grab Prize Money worth",
              level: 2,
              align: "center",
              size: "heading",
              fontSize: 24,
              fontFamily: "Inter",
              bold: true,
              color: "#73479e"
            }
          }
        ],
        layout: {
          direction: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 16,
          padding: 24,
          backgroundColor: "transparent"
        }
      },
      {
        id: "section-prizes",
        sectionName: "Prizes",
        showInNavbar: true,
        components: [
          {
            id: "card-1",
            type: "card",
            props: {
              title: "1st Prize",
              description: "₹1,00,000",
              backgroundColor: "#ffffff",
              borderColor: "#e5e7eb",
              padding: 24,
              cardType: "icon",
              icon: "🥇"
            }
          },
          {
            id: "card-2",
            type: "card",
            props: {
              title: "2nd Prize",
              description: "₹75,000",
              backgroundColor: "#ffffff",
              borderColor: "#e5e7eb",
              padding: 24,
              cardType: "icon",
              icon: "🥈"
            }
          },
          {
            id: "card-3",
            type: "card",
            props: {
              title: "3rd Prize",
              description: "₹50,000",
              backgroundColor: "#ffffff",
              borderColor: "#e5e7eb",
              padding: 24,
              cardType: "icon",
              icon: "🥉"
            }
          }
        ],
        layout: {
          direction: "row",
          justifyContent: "space-between",
          alignItems: "stretch",
          gap: 24,
          padding: 37,
          backgroundColor: "transparent"
        }
      },
      {
        id: "section-disclaimer",
        sectionName: "",
        showInNavbar: false,
        components: [
          {
            id: "text-disclaimer",
            type: "text",
            props: {
              text: "*Subject to applicable tax deductions",
              align: "center",
              size: "text",
              fontSize: 16,
              fontFamily: "Source Sans Pro",
              color: "#3b0764"
            }
          }
        ],
        layout: {
          direction: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 16,
          padding: 24,
          backgroundColor: "transparent"
        }
      },
      {
        id: "section-problems",
        sectionName: "Problems",
        showInNavbar: true,
        components: [
          {
            id: "text-problems",
            type: "text",
            props: {
              text: "Problem statements here",
              align: "center",
              size: "title",
              fontSize: 36,
              fontFamily: "Inter",
              color: "#1e293b"
            }
          }
        ],
        layout: {
          direction: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 16,
          padding: 24,
          backgroundColor: "transparent"
        }
      },
      {
        id: "section-problem-button",
        sectionName: "",
        showInNavbar: false,
        components: [
          {
            id: "button-problems",
            type: "button",
            props: {
              text: "Problem Statements",
              href: "https://unstop.com",
              variant: "secondary",
              align: "center"
            }
          }
        ],
        layout: {
          direction: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 16,
          padding: 24,
          backgroundColor: "transparent"
        }
      },
      {
        id: "section-winners",
        sectionName: "Winners",
        showInNavbar: true,
        components: [
          {
            id: "text-winners",
            type: "text",
            props: {
              text: "WINNERS",
              align: "center",
              size: "title",
              fontSize: 36,
              fontFamily: "Source Sans Pro",
              bold: true,
              underline: true,
              color: "#3b0764"
            }
          }
        ],
        layout: {
          direction: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 16,
          padding: 24,
          backgroundColor: "transparent"
        }
      },
      {
        id: "section-winner-1",
        sectionName: "",
        showInNavbar: false,
        components: [
          {
            id: "card-winner-1",
            type: "card",
            props: {
              title: "Team Lorem",
              description: "Team members: Lorem Ipsum, Kolem Yuji, Polem Mauh",
              backgroundColor: "#ffffff",
              borderColor: "#e5e7eb",
              padding: 24
            }
          }
        ],
        layout: {
          direction: "column",
          justifyContent: "center",
          alignItems: "stretch",
          gap: 24,
          padding: 40,
          backgroundColor: "transparent"
        }
      },
      {
        id: "section-winner-2",
        sectionName: "",
        showInNavbar: false,
        components: [
          {
            id: "card-winner-2",
            type: "card",
            props: {
              title: "Team Phi",
              description: "Team members: Lorem Ipsum, Kole Yuji, Pole Mauh",
              backgroundColor: "#ffffff",
              borderColor: "#e5e7eb",
              padding: 24
            }
          }
        ],
        layout: {
          direction: "column",
          justifyContent: "center",
          alignItems: "stretch",
          gap: 24,
          padding: 40,
          backgroundColor: "transparent"
        }
      },
      {
        id: "section-winner-3",
        sectionName: "",
        showInNavbar: false,
        components: [
          {
            id: "card-winner-3",
            type: "card",
            props: {
              title: "Team Ipsum",
              description: "Team members: Lorem Ipsum, Kolem Yuji, Polem Mauh",
              backgroundColor: "#ffffff",
              borderColor: "#e5e7eb",
              padding: 24
            }
          }
        ],
        layout: {
          direction: "column",
          justifyContent: "center",
          alignItems: "stretch",
          gap: 24,
          padding: 40,
          backgroundColor: "transparent"
        }
      },
      {
        id: "section-gallery",
        sectionName: "Gallery",
        showInNavbar: true,
        components: [
          {
            id: "heading-gallery",
            type: "heading",
            props: {
              text: "Gallery",
              align: "center",
              fontSize: 32,
              fontFamily: "Libre Baskerville",
              bold: true,
              color: "#3b0764"
            }
          }
        ],
        layout: {
          direction: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 16,
          padding: 24,
          backgroundColor: "transparent"
        }
      },
      {
        id: "section-timer",
        sectionName: "",
        showInNavbar: false,
        components: [
          {
            id: "timer-1",
            type: "timer",
            props: {
              targetDate: "2025-12-31",
              title: "EVENT STARTS IN!!!",
              backgroundColor: "#8f38b7",
              textColor: "#ffffff",
              fontSize: 48,
              showLabels: true
            }
          }
        ],
        layout: {
          direction: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 16,
          padding: 24,
          backgroundColor: "transparent"
        }
      },
      {
        id: "section-rules",
        sectionName: "",
        showInNavbar: false,
        components: [
          {
            id: "collapsible-list-1",
            type: "collapsible-list",
            props: {
              items: [
                "Do not plagiarize any code",
                "Do not bring any substances to the venue",
                "Do not leave your assigned places without supervisor permission",
                "Do not Litter the campus"
              ],
              expanded: false,
              buttonTextShow: "Show Rules",
              buttonTextHide: "Hide Rules",
              align: "center",
              width: "400px"
            }
          }
        ],
        layout: {
          direction: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 16,
          padding: 24,
          backgroundColor: "transparent"
        }
      },
      {
        id: "section-footer",
        sectionName: "",
        showInNavbar: false,
        components: [
          {
            id: "footer-1",
            type: "footer",
            props: {
              companyName: "Your Hackathon",
              description: "Building amazing experiences for our participants.",
              backgroundColor: "#d970ff",
              textColor: "#000000",
              link1Text: "About",
              link1Url: "#",
              link2Text: "Schedule",
              link2Url: "#",
              link3Text: "Contact",
              link3Url: "#",
              social1Text: "Twitter",
              social1Url: "#",
              social2Text: "LinkedIn",
              social2Url: "#",
              social3Text: "Facebook",
              social3Url: "#"
            }
          }
        ],
        layout: {
          direction: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 16,
          padding: 0,
          backgroundColor: "#1f2937"
        }
      }
    ]
  }
];
