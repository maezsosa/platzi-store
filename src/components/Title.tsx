import React from 'react';

type TitleProps = {
  title: string;
};

const Title = ({ title }: TitleProps) => <span>{title}</span>;

export default Title;
