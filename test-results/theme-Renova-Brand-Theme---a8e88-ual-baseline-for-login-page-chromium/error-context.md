# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - heading "Nuclear logo NUCLEAR" [level=4] [ref=e5]:
        - img "Nuclear logo" [ref=e6]
        - text: NUCLEAR
      - paragraph [ref=e7]: Nuclear Supply Chain Management
    - generic [ref=e8]:
      - tablist [ref=e9]:
        - tab "Login" [selected] [ref=e10] [cursor=pointer]
        - tab "Sign Up" [ref=e11] [cursor=pointer]
      - tabpanel "Login" [ref=e12]:
        - generic [ref=e13]:
          - generic [ref=e14]:
            - generic [ref=e15]:
              - text: Email
              - textbox "Email" [ref=e16]:
                - /placeholder: you@example.com
            - generic [ref=e17]:
              - text: Password
              - textbox "Password" [ref=e18]
          - generic [ref=e19]:
            - button "Sign In" [ref=e20] [cursor=pointer]
            - button "Forgot password?" [ref=e21] [cursor=pointer]
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e27] [cursor=pointer]:
    - img [ref=e28]
  - alert [ref=e31]
```