import React from 'react';
import ImageAnnotationEdit from './ImageAnnotationEdit';

export default props => {
  let data = {
    items: {
      '1516645519674': {
        id: 1516645519674,
        type: 'rectangle',
        left: 111.44278606965175,
        top: 58.609271523178805,
        width: 176.11940298507466,
        height: 70.52980132450331,
        angle: 0,
        scaleX: 1,
        scaleY: 1,
      },
      '1516645525740': {
        id: 1516645525740,
        type: 'rectangle',
        left: 400,
        top: 102.31788079470198,
        width: 75.62189054726372,
        height: 50.66225165562915,
        angle: 0,
        scaleX: 1,
        scaleY: 1,
        caption: 'bbb',
      },
      '1516645533083': {
        id: 1516645533083,
        type: 'circle',
        left: 126.3681592039801,
        top: 110.15123060195711,
        radius: 68.65671641791045,
        angle: 0,
        scaleX: 1,
        scaleY: 1,
      },
      '1516645546106': {
        id: 1516645546106,
        type: 'circle',
        left: 485.5721393034826,
        top: 45.59322592336329,
        radius: 61.69154228855723,
        angle: 0,
        scaleX: 1,
        scaleY: 1,
      },
      '1516646276194': {
        id: 1516646276194,
        type: 'rectangle',
        left: 327.363184079602,
        top: 248.34437086092714,
        width: 118.407960199005,
        height: 73.50993377483445,
        angle: 0,
        scaleX: 1,
        scaleY: 1,
        caption: 'asdad',
      },
    },
  };

  let data_ = JSON.parse(localStorage.getItem('annData'));

  let options = [
    'Microaneurysm',
    'Haemorrhages',
    'Venous bedding ',
    'Intraretinal microvascular abnormalities(IRMA)',
    'New vessels at the disc (NVD)',
    'New vessels elsewhere (NVE)',
    'Vitreous haemorrhage',
    'Pre retinal haemorrrhage',
    'Hard exudates',
    'Retinal thickening',
  ];

  const update = data => {
    localStorage.setItem('annData', JSON.stringify(data));
  };

  return (
    <div>
      <ImageAnnotationEdit
        imageURL="http://www.ultrahdfreewallpapers.com/uploads/large/animals/cat-hd-wallpaper-0380.jpg"
        height={600}
        width={800}
        data={data_}
        update={update}
        options={options}
      />
    </div>
  );
};
