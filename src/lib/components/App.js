import React from 'react';
import ImageAnnotationEdit from './ImageAnnotationEdit';

export default class App extends React.Component {

    constructor(props) {
        super(props);

        this.options = [
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

        let sampleData = {
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

        this.state = {
            data: JSON.parse(localStorage.getItem('annData'))
        };

        this.add = this.add.bind(this);
        this.update = this.update.bind(this);
        this.remove = this.remove.bind(this);
    }

    update(data) {
        localStorage.setItem('annData', JSON.stringify(data));
    }

    remove(item) {
        let data = this.state.data;
        let items = data.items;
        delete items[item.id];
        data.items = items;
        console.log(data, 1111);
        this.setState({data});
    }

    add(item, cb) {
        item.id = new Date().getTime();
        let data = this.state.data;
        data.items[item.id] = item;
        this.setState({
            data
        }, ()=>{
            cb && cb(item.id);
        });
    }

    render() {
        return <div>
            <ImageAnnotationEdit
                imageURL="http://www.ultrahdfreewallpapers.com/uploads/large/animals/cat-hd-wallpaper-0380.jpg"
                height={600}
                width={800}
                data={this.state.data}
                update={this.update}
                remove={this.remove}
                add={this.add}
                options={this.options}
            />
        </div>;
    }
}
