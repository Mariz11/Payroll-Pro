export const renderHeader = () => {
  return (
    <span className="ql-formats">
      <select className="ql-header" aria-label="Heading">
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
        <option value="4">Heading 4</option>
        <option value="5">Heading 5</option>
        <option value="6">Heading 6</option>
        <option value="">Normal</option>
        <option value="sub">Subheading</option>
      </select>

      <button className="ql-bold" aria-label="Bold"></button>
      <button className="ql-italic" aria-label="Italic"></button>
      <button className="ql-underline" aria-label="Underline"></button>
      <button className="ql-strike" aria-label="Strike"></button>
      <button className="ql-link" aria-label="Link"></button>
      <button
        className="ql-list"
        value="ordered"
        aria-label="Ordered List"
      ></button>
      <button
        className="ql-list"
        value="bullet"
        aria-label="Bullet List"
      ></button>
      <button
        className="ql-indent"
        value="+1"
        aria-label="Increase Indent"
      ></button>
      <button
        className="ql-indent"
        value="-1"
        aria-label="Decrease Indent"
      ></button>
      <select className="ql-align" aria-label="Align">
        <option defaultValue="left"></option>
        <option value="center"></option>
        <option value="right"></option>
        <option value="justify"></option>
      </select>
    </span>
  );
};
