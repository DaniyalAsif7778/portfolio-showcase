# Minimalist Motion Engineering

- Never use abrupt, jerky linear transitions or overly fast bounce transitions.
- Every element fade-in and structural movement must follow an elegant cubic-bezier easing curve: cubic-bezier(0.16, 1, 0.3, 1) [Ultra-premium ease-out].
- Implement deliberate stagger delays: Sequence text reveals on page entry with a 0.05s stagger per line.
- Enforce layout structural integrity: Elements must never shift around dynamically on scroll; animate only properties like transform (translateY) and opacity.
